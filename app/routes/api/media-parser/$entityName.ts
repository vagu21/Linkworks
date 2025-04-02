import { json } from "@remix-run/node";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import ApiHelper from "~/utils/helpers/ApiHelper";
import { getTenantByIdOrSlug } from "~/utils/db/tenants.db.server";
import { validateRequest } from "~/utils/session.server";

export const action = async ({ request, params }: any) => {
  try {
    await validateRequest(request);
    const { entityName } = params; // Get the entity name from the route
    const formData = await request.formData();
    const entityData = JSON.parse(formData.get("entityData") as string);
    const tenantSlug = JSON.parse(formData.get("tenant") as string);
    if (!tenantSlug) {
      return json({ error: "Tenant slug is missing" }, { status: 400 });
    }
    

    const tenantId : string|null = await getTenantByIdOrSlug(tenantSlug)  as string|null;
    if (!tenantId) {
      return json({ error: `Tenant with slug '${tenantSlug}' not found` }, { status: 404 });
    }

    if (!entityName) {
      return json({ error: "Entity name is missing in the route" }, { status: 400 });
    }

    // Fetch the entity for the given entity name and tenant ID
    const entity = await getEntityByName({ tenantId, name: entityName });

    if (!entity) {
      return json({ error: `Entity '${entityName}' not found` }, { status: 404 });
    }

    // Map the data to the entity structure
    const rowValues = ApiHelper.getRowPropertiesFromJson(undefined, entity, entityData);

    // Save the data
    const item = await RowsApi.create({
      entity,
      tenantId,
      userId: undefined,
      rowValues,
      time: undefined,
      request: undefined,
    });

    if (!item) {
      return json({ error: `Failed to create ${entityName}` }, { status: 500 });
    }
    return json({ success: true, item });
  } catch (error) {
    console.error("Action error:", error);
    return json({ error: "Something went wrong" }, { status: 500 });
  }
};
