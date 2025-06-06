import { ActionFunction, json, LoaderFunctionArgs, redirect } from "@remix-run/node";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { EntityViewsApi } from "~/utils/api/.server/EntityViewsApi";
import { getEntityView, deleteEntityView } from "~/utils/db/entities/entityViews.db.server";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import RowsRequestUtils from "../utils/RowsRequestUtils";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import FormulaService from "~/modules/formulas/services/.server/FormulaService";
import PromptBuilderService from "~/modules/promptBuilder/services/.server/PromptBuilderService";
import { EntityView } from "@prisma/client";
import { PromptExecutionResultDto } from "~/modules/promptBuilder/dtos/PromptExecutionResultDto";
import { getRowsInIds } from "~/utils/db/entities/rows.db.server";
import { GraphApi } from "~/custom/modules/graphs/routes/api/graphRoutes.Index.Api";
import { getChartConfigWithChartData } from "~/custom/modules/graphs/utils";

export namespace Rows_List {
  export type LoaderData = {
    meta: MetaTagsDto;
    rowsData: RowsApi.GetRowsData;
    routes: EntitiesApi.Routes;
    chartConfig: any;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_List] ${params.entity}`);
    const { t, userId, tenantId, entity } = await RowsRequestUtils.getLoader({ request, params });
    await time(verifyUserHasPermission(request, getEntityPermission(entity, "view"), tenantId), "verifyUserHasPermission");
    if (!entity.isAutogenerated || entity.type === "system") {
      throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404");
    }
    const rowsData = await time(
      RowsApi.getAll({
        entity,
        tenantId,
        userId,
        urlSearchParams: new URL(request.url).searchParams,
        time,
      }),
      "RowsApi.getAll"
    );
    await time(
      FormulaService.trigger({ trigger: "BEFORE_LISTED", rows: rowsData.items, entity: rowsData.entity, session: { tenantId, userId }, t }),
      "FormulaService.trigger.BEFORE_LISTED"
    );
    const data: LoaderData = {
      meta: [{ title: `${t(entity.titlePlural)} | ${process.env.APP_NAME}` }],
      rowsData,
      routes: EntitiesApi.getNoCodeRoutes({ request, params }),
      chartConfig: await getChartData(params, tenantId, request),
    };
    return json(data, { headers: getServerTimingHeader() });
  };

  export type ActionData = {
    success?: string;
    error?: string;
    updatedView?: EntityView;
    rowsDeleted?: string[];
    promptFlowExecutionResult?: PromptExecutionResultDto | null;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_List] ${params.entity}`);
    const { t, userId, tenantId, entity, form } = await RowsRequestUtils.getAction({ request, params });
    const action = form.get("action")?.toString() ?? "";
    if (action === "view-create") {
      try {
        const view = await time(EntityViewsApi.createFromForm({ entity, form, createdByUserId: userId }), "EntityViewsApi.createFromForm");
        return redirect(new URL(request.url, request.url).pathname + "?v=" + view.name, { headers: getServerTimingHeader() });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
      }
    } else if (action === "view-edit" || action === "view-delete") {
      const id = form.get("id")?.toString() ?? "";
      const item = await time(getEntityView(id), "getEntityView");
      if (!item) {
        return json({ error: t("shared.notFound") }, { status: 400, headers: getServerTimingHeader() });
      }
      try {
        if (action === "view-edit") {
          const updatedView = await time(EntityViewsApi.updateFromForm({ entity, item, form }), "EntityViewsApi.updateFromForm");
          const actionData: ActionData = {
            updatedView,
          };
          return json(actionData, { headers: getServerTimingHeader() });
        } else {
          await time(deleteEntityView(item.id), "deleteEntityView");
          return redirect(new URL(request.url, request.url).pathname + "?v=", { headers: getServerTimingHeader() });
        }
      } catch (e: any) {
        return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
      }
    } else if (["move-up", "move-down"].includes(action)) {
      const id = form.get("id")?.toString() ?? "";
      await time(
        RowsApi.changeOrder(id, {
          target: action === "move-up" ? "up" : "down",
        }),
        "RowsApi.changeOrder"
      );
      return json({}, { headers: getServerTimingHeader() });
    } else if (action === "run-prompt-flow") {
      try {
        const promptFlowExecutionResult = await PromptBuilderService.runFromForm({ request, params, form, tenantId, userId, time, t });
        const actionData: ActionData = {
          promptFlowExecutionResult,
        };
        return json(actionData, { headers: getServerTimingHeader() });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
      }
    } else if (action === "bulk-delete") {
      if (!entity.hasBulkDelete) {
        return json({ error: t("shared.invalidForm") }, { status: 400, headers: getServerTimingHeader() });
      }
      const rowIds = form.getAll("rowIds[]") as string[];
      try {
        const rows = await getRowsInIds(rowIds);
        const inexistentRows = rowIds.filter((id) => !rows.find((f) => f.id === id));
        if (inexistentRows.length > 0) {
          return json({ error: t("shared.notFound") }, { status: 400, headers: getServerTimingHeader() });
        }
        const rowsDeleted: string[] = [];
        await Promise.all(
          rows.map(async (row) => {
            const deleted = await RowsApi.del(row.id, { entity, tenantId, userId });
            rowsDeleted.push(deleted.id);
          })
        );
        return json({ success: t("shared.deleted"), rowsDeleted }, { headers: getServerTimingHeader() });
      } catch (e: any) {
        return json({ error: e.message }, { status: 400, headers: getServerTimingHeader() });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400, headers: getServerTimingHeader() });
    }
  };
}


async function getChartData(params: any, tenantId: string | null, request: Request) {
  const graphapi = new GraphApi();
  const chartConfigs = await graphapi.getEntityGraphConfig(params.tenant || "", params.entity || "", params.group || "");
  await getChartConfigWithChartData(chartConfigs, tenantId, request);

  return chartConfigs;
}
