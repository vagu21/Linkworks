import { LoaderFunctionArgs, redirect, ActionFunction, json } from "@remix-run/node";
import { MetaTagsDto } from "~/application/dtos/seo/MetaTagsDto";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import UrlUtils from "~/utils/app/UrlUtils";
import { EntityWithDetails, getAllEntities } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { getEntityPermission } from "~/utils/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import RowHelper from "~/utils/helpers/RowHelper";
import { getUserInfo } from "~/utils/session.server";
import RowsRequestUtils from "../utils/RowsRequestUtils";
import { createMetrics } from "~/modules/metrics/services/.server/MetricTracker";
import FormulaService from "~/modules/formulas/services/.server/FormulaService";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { useFetcher } from "@remix-run/react";
import { createUserInvitation } from "~/utils/db/tenantUserInvitations.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { sendEmail } from "~/utils/email.server";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { getUser } from "~/utils/db/users.db.server";
import { getTenant } from "~/utils/db/tenants.db.server";
import { MemberInvitationCreatedDto } from "~/modules/events/dtos/MemberInvitationCreatedDto";
import { getBaseURL } from "~/utils/url.server";
import { sendInvitation } from "~/modules/companyMembers/companyMemberInvitation";
import { db } from "~/utils/db.server";

export namespace Rows_New {
  export type LoaderData = {
    meta: MetaTagsDto;
    entityData: EntitiesApi.GetEntityData;
    routes: EntitiesApi.Routes;
    allEntities: EntityWithDetails[];
    relationshipRows: RowsApi.GetRelationshipRowsData;
  };
  export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_New] ${params.entity}`);
    const { t, userId, tenantId, entity } = await RowsRequestUtils.getLoader({ request, params });
    if (!entity.isAutogenerated || entity.type === "system") {
      throw redirect(tenantId ? UrlUtils.currentTenantUrl(params, "404") : "/404", { status: 404, headers: getServerTimingHeader() });
    }
    const entityData = await time(
      EntitiesApi.get({
        entity,
        tenantId,
        userId,
      }),
      "EntitiesApi"
    );
    await time(verifyUserHasPermission(request, getEntityPermission(entity, "create"), tenantId), "verifyUserHasPermission");
    const data: LoaderData = {
      meta: [{ title: `${t("shared.create")} ${t(entity.title)} | ${process.env.APP_NAME}` }],
      entityData,
      routes: EntitiesApi.getNoCodeRoutes({ request, params }),
      allEntities: await time(getAllEntities({ tenantId, active: true }), "getAllEntities"),
      relationshipRows: await time(RowsApi.getRelationshipRows({ entity, tenantId, userId }), "RowsApi.getRelationshipRows"),
    };
    return json(data, { headers: getServerTimingHeader() });
  };

  export type ActionData = {
    saveAndAdd?: boolean;
    newRow?: RowWithDetails;
    error?: string;
  };
  export const action: ActionFunction = async ({ request, params }) => {
    const { time, getServerTimingHeader } = await createMetrics({ request, params }, `[Rows_New] ${params.entity}`);
    const { t, userId, tenantId, entity, form } = await RowsRequestUtils.getAction({ request, params });
    const action = form.get("action");
    if (action === "create") {
      try {
        await time(verifyUserHasPermission(request, getEntityPermission(entity, "create"), tenantId), "verifyUserHasPermission");
        const rowValues = RowHelper.getRowPropertiesFromForm({ t: t, entity, form });
        const entityName = entity?.name;
        const article = /^[aeiouAEIOU]/.test(entityName) ? "An" : "A";

        const uniqueFields = Object.entries(entity.properties)
          .filter(([key, value]) => value.isUnique)
          .map(([key, value]) => ({ ...value }));

        if (uniqueFields.length > 0) {
          for (const field of uniqueFields) {
            const { type, id, name: fieldName } = field;
            const formField = rowValues.dynamicProperties.find((item) => item.propertyId === id);

            let fieldValue;
            let whereCondition = { propertyId: id };

            if (type === 0) {
              fieldValue = formField?.numberValue;
              whereCondition = { ...whereCondition, numberValue: fieldValue };
            } else if (type === 1) {
              fieldValue = formField?.textValue;
              whereCondition = { ...whereCondition, textValue: fieldValue };
            } else if (type === 2) {
              fieldValue = formField?.dateValue;
              whereCondition = { ...whereCondition, dateValue: fieldValue };
            }

            if (fieldValue !== undefined) {
              const existingRows = await db.rowValue.findMany({
                where: {
                  AND: [whereCondition],
                },
              });

              if (existingRows.length > 0) {
                return json(
                  {
                    error: `${article} ${entityName} with the ${fieldName} '${fieldValue}' already exists. Please use a different ${fieldName} or modify the existing entry.`,
                  },
                  { status: 400 }
                );
              }
            }
          }
        }

        const newRow = await time(
          RowsApi.create({
            entity,
            tenantId,
            userId: (await getUserInfo(request)).userId,
            rowValues,
            request,
          }),
          "RowsApi.create"
        );
        if (params.entity == "account") {
          const enabled = form.get("enabled");
          if (enabled == "true") {
            const numberOfUsers = Number(form.get("numberOfUsers"));
            if (numberOfUsers == 0) {
              return json({ error: "Add atleast one company Member" });
            }
            sendInvitation(form, newRow.id, params, userId, request);
          }
        }
        await time(
          FormulaService.trigger({ trigger: "AFTER_CREATED", rows: [newRow], entity: entity, session: { tenantId, userId }, t }),
          "FormulaService.trigger.AFTER_CREATED"
        );
        const onCreatedRedirect = form.get("onCreatedRedirect");
        if (onCreatedRedirect) {
          if (onCreatedRedirect === "addAnother") {
            return json({ saveAndAdd: true, newRow, headers: getServerTimingHeader() });
          }
          const routes = EntityHelper.getRoutes({ routes: EntitiesApi.getNoCodeRoutes({ request, params }), entity, item: newRow });
          if (routes) {
            if (!entity.onCreated || entity.onCreated === "redirectToOverview") {
              return redirect(routes?.overview ?? "", { headers: getServerTimingHeader() });
            } else if (entity.onCreated === "redirectToEdit") {
              return redirect(routes?.edit ?? "", { headers: getServerTimingHeader() });
            } else if (entity.onCreated === "redirectToList") {
              return redirect(routes?.list ?? "", { headers: getServerTimingHeader() });
            } else if (entity.onCreated === "redirectToNew") {
              return json({ newRow, replace: true }, { headers: getServerTimingHeader() });
            } else if (params.group && entity.onCreated === "redirectToGroup") {
              return redirect(routes?.group ?? "", { headers: getServerTimingHeader() });
            }
          }
        }
        const redirectTo = form.get("redirect")?.toString() || new URL(request.url).searchParams.get("redirect")?.toString();
        if (redirectTo) {
          return redirect(redirectTo, { headers: getServerTimingHeader() });
        }
        return json({ newRow, headers: getServerTimingHeader() });
      } catch (error: any) {
        return json({ error: error.message }, { status: 400, headers: getServerTimingHeader() });
      }
    } else {
      return json({ error: t("shared.invalidForm") }, { status: 400, headers: getServerTimingHeader() });
    }
  };
}
