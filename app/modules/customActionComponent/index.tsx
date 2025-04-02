import { downloadAction } from "~/modules/mediaExport";
import { DownloadButton } from "~/custom/components/button/DownloadButton";

function ActionButton({ buttonTitle }: { buttonTitle: string }) {
  return (
    <div>
      <DownloadButton text={buttonTitle} />
    </div>
  );
}

export function getConditionalActions(entity: any, onRemove: any, setLoading: any) {
  const actions = [];
  switch (entity.name) {
    case "Candidate":
      actions.push({
        title: "ResumeAction",
      });
      break;
    case "Job":
      actions.push({
        title: <ActionButton buttonTitle={"Download JD"} />,
        onClick: async (_: any, item: any) => {
          try {
            setLoading(true);
            await downloadAction(item.id, "job");
            setLoading(false);
          } catch (error) {
            console.error(error);
            setLoading(false);
          }
        },
      });
      break;
    default:
      break;
  }

  return actions;
}
