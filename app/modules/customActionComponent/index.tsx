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

export function getConditionalActions(entity: any, onRemove: any) {
  const actions = [];
  
  switch (entity.name) {
    case "Candidate":
      actions.push({
        title: <ActionButton buttonTitle={"Summary"} />,
        onClick: (_: any, item: any) => downloadAction(item.id, "resume"),
      });
      break;

    case "Job":
      actions.push({
        title: <ActionButton buttonTitle={"Download JD"} />,
        onClick: (_: any, item: any) => downloadAction(item.id, "job"),
      });
      break;

    default:
      break;
  }

  return actions;
}
