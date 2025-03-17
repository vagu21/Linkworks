import { Link } from "@remix-run/react";
import RightIcon from "~/components/ui/icons/RightIcon";
import clsx from "clsx";
import ColorHoverUtils from "~/utils/shared/colors/ColorHoverUtils";
import type { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";

export default function KbArticles({
  kb,
  items,
}: {
  kb: KnowledgeBaseDto;
  items: {
    order: number;
    title: string;
    description: string;
    href: string;
    sectionId: string | null;
  }[];
}) {
  return (
    <div className="border-border bg-background rounded-md border py-3">
      {items.map((item) => {
        return (
          <div key={item.title} className={clsx("group", ColorHoverUtils.getBorder500(kb.color))}>
            <Link to={item.href}>
              <div className="hover:bg-secondary flex items-center justify-between space-x-2 px-6 py-3">
                <div className="">
                  <div className={clsx(" text-muted-foreground group-hover:text-foreground")}>{item.title}</div>
                </div>
                <RightIcon className={clsx("text-muted-foreground group-hover:text-foreground h-5 w-5 flex-shrink-0")} />
              </div>
            </Link>
          </div>
        );
      })}
    </div>
  );
}
