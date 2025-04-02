import { ActionFunction, LoaderFunction, json, ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { GraphApi } from "./graphRoutes.Index.Api";
import { getAllEntities, getAllGroups } from "~/utils/db/entities/entities.db.server";
import { getUserInfo } from "~/utils/session.server";
import { db } from "~/utils/db.server";
import { adminGetAllTenants } from "~/utils/db/tenants.db.server";

export namespace Graph_List {
  export const loader: LoaderFunction = async ({ request, params }: LoaderFunctionArgs) => {
    const entities = await getAllEntities({ tenantId: null });
    const tenants = await adminGetAllTenants();
    // const data = await getUserInfo(request);
    const groups = await getAllGroups();

    
    const graphapi = new GraphApi();
    const chartconfigs = await graphapi.getAllGraphConfigs();
    return json({
      entities: entities,
      chartconfigs: chartconfigs,
      tenants: tenants,
      groups: groups,
    });
    return json(entities);
  };

  export const action: ActionFunction = async ({ request, params }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const graphapi = new GraphApi();

     const data = await getUserInfo(request);

     let userData = await db.user.findUnique({
       where: {
         id: data?.userId,
       },
     });

     let tenantId = userData?.defaultTenantId;

    const parseJSON = (value: FormDataEntryValue | null) => {
      if (!value) return null;
      if (typeof value === "string") {
        try {
          return JSON.parse(value);
        } catch (error) {
          return { success: false, error: error };
        }
      }
      return value;
    };

    const id = formData.get("id") || "";
    const isDelete = formData.get("isDelete") || "false";
    if (isDelete === "true") {
      try {
        const deletedGraphData = await graphapi.deleteChart(String(id));
        return { success: true, message: deletedGraphData };
      } catch (error) {
        return { success: false, error: error };
      }
    }
    const entityId = formData.get("entityId") || "";
    const title = formData.get("title") || "string";
    const description = formData.get("description") || "string";
    const visualizationType = formData.get("visualizationType") || "trend-chart";
    const graphWidth = formData.get("graphWidth") || "100";
    const entitySlug = formData.get("entitySlug") || "";
    const groupSlug = formData.get("groupSlug") || "";
    const timeGranularity = formData.get("timeGranularity") || "string";
    const dateField = formData.get("dateField") || "string";
    const groupBy = parseJSON(formData.get("groupBy")) ?? [{ property: "", type: "", id: "" }];
    const subGroupBy = parseJSON(formData.get("subGroupBy")) ?? ["string"];
    const metrics = parseJSON(formData.get("metrics")) ?? [{ name: "", property: "", operation: "count" }];
    const tenantIds = parseJSON(formData.get("tenantIds")) ?? [""];
    const filters = parseJSON(formData.get("filters")) ?? [{ field: "fieldname", operator: "=", value: "G-WEST", fieldId: "" }];
    const computedFields = parseJSON(formData.get("computedFields")) ?? [{ field_a: "string", field_b: "", operator: "+, -, /, * etc" }];
    const compareWith = parseJSON(formData.get("compareWith")) ?? { entityId: "string", dateField: "string", timeShift: "string" };
    const isEdit = formData.get("isEdit") || false;
    const graphConfig = {
      id,
      entityId,
      title,
      description,
      tenantId,
      graphWidth,
      entitySlug,
      groupSlug,
      visualizationType,
      groupBy,
      subGroupBy,
      metrics,
      tenantIds,
      filters,
      computedFields,
      timeGranularity,
      dateField,
      compareWith,
    };

    try {
      let postedGraphData;
      if (isEdit==="true") {
        postedGraphData = await graphapi.updateChartConfig(String(id), graphConfig);
      } else {
        postedGraphData = await graphapi.postGraphConfig(graphConfig);
      }
      return { success: true, message: postedGraphData };
    } catch (error) {
      return { success: false, error: error };
    }
  };
}
