import clsx from "clsx";
import { Colors } from "~/application/enums/shared/Colors";
import { getBadgeColor } from "~/utils/shared/ColorUtils";

interface Props {
  color?: Colors | null;
  size?: "sm" | "md";
}

export default function ColorBadge({ color, size = "md" }: Props) {
  return (
    <span
      className={clsx(
        " inline-flex flex-shrink-0 items-center rounded-full text-xs font-medium",
        getBadgeColor(color),
        // size === "md" && "p-1",
        // size === "sm" && "p-0.5",
        "border-none"
      )}
    >
      <svg className={clsx(size === "md" && "h-3 w-3", size === "sm" && "h-1.5 w-1.5")} fill="currentColor" viewBox="0 0 8 8">
        <circle cx={4} cy={4} r={3} />
      </svg>
    </span>
  );
}
