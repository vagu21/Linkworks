import { downloadAction } from "~/modules/mediaExport";
import { DownloadButton } from "~/custom/components/button/DownloadButton";

function ActionButton({ buttonTitle }: { buttonTitle: string }) {
  return (
    <div>
      <DownloadButton text={buttonTitle} />
    </div>
  );
}

export async function getConditionalActions(entity: any, onRemove: any, setLoading: any) {
  const actions = [];
  const res = await fetch(`/api/getAllRows?entity=${entity.name}&trigger=On Tables`);
  const data = await res.json();
    if (data.items.length > 0) {
      actions.push({});
    }

  return actions;
}
