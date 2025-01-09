import { DownloadIcon } from "lucide-react";
import { downloadAction } from "~/modules/mediaExport";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";


function ActionButton({ buttonTitle }: { buttonTitle: string }) {
  return (
    <div>
      <ButtonSecondary className="gap-2">
        {buttonTitle}
        <DownloadIcon className="h-4 w-4 text-gray-500" />
      </ButtonSecondary>
    </div>
  );
}

export function getConditionalActions(entity: any, onRemove: any) {
  const actions = [];
  
  switch (entity.name) {
    case "Candidates":
      actions.push({
        title: <ActionButton buttonTitle={"Concise Resume"} />,
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
