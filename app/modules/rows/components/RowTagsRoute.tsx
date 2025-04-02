import { Rows_Tags } from "../routes/Rows_Tags.server";
// import RowSettingsTags from "~/components/entities/rows/RowSettingsTags";
import { useTypedLoaderData } from "remix-typedjson";
import EditTag from "~/custom/components/recruitment/tagsAndTasks/EditTag";

export default function RowTagsRoute() {
  const data = useTypedLoaderData<Rows_Tags.LoaderData>();
  return <EditTag item={data.rowData.item} tags={data.tags} />;
}
