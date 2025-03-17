import { RowsApi } from "~/utils/api/.server/RowsApi";
import { getAllEntities } from "~/utils/db/entities/entities.db.server";
import ApiHelper from "~/utils/helpers/ApiHelper";

export const rowFetcher = async (id: any, entityName: string) => {
  try {
    let entity = { name: entityName };
    const row: any = await RowsApi.get(id!, { entity });
    const entities = await getAllEntities({ tenantId: null });
    const data = ApiHelper.getApiFormatWithRelationships({
      entities,
      item: row.item,
    });
    return data;
  } catch (error) {
    console.error("An error occurred while Fetching Row in rowFetcher Component:", error);
    throw error;
  }
};
