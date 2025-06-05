import { getEntityPermission, getUserHasPermission } from "~/utils/helpers/PermissionsHelper";
import Tags from "./tags";
import Tasks from "./tasks";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";

export default function TagsAndTasks({ rowData, options }: any) {
  const appOrAdminData = useAppOrAdminData();
  function canUpdate() {
    if (options?.disableUpdate) {
      return false;
    }
    if (!getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "update"))) {
      return false;
    }
    if (!rowData.rowPermissions.canUpdate) {
      return false;
    }
    return true;
  }
  return (
    <>
      {rowData?.entity?.hasTags && !options?.hideTags && <Tags items={rowData.tags} onSetTagsRoute={canUpdate() ? "tags" : undefined} />}
      {rowData?.entity?.hasTasks && !options?.hideTasks && <Tasks items={rowData.tasks} />}
    </>
  );
}
