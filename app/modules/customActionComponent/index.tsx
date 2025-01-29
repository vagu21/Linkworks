import { DownloadIcon } from "lucide-react";
import { downloadAction } from "~/modules/mediaExport";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";

function ActionButton({ buttonTitle }: { buttonTitle: string }) {
  return (
    <div>
      <ButtonPrimary className="gap-2">
        {buttonTitle}
        <DownloadIcon className="h-4 w-4 text-white" />
      </ButtonPrimary>
    </div>
  );
}

export function getConditionalActions(entity: any, onRemove: any, setLoading: any) {
  const actions = [];

  switch (entity.name) {
    case "Candidate":
      actions.push({
        title: <ActionButton buttonTitle={"Summary"} />,

        onClick: async (_: any, item: any) => {
          try {
            setLoading(true);
            await downloadAction(item.id, "resume");
            setLoading(false);
          } catch (error) {
            console.error(error);
            setLoading(false);
          }
        },
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
