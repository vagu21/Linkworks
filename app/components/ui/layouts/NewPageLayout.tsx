import { ReactNode } from "react";
import BreadcrumbCustom from "~/custom/components/breadcrumbs/Breadcrumb";

interface Props {
  title: string;
  menu?: {
    title: string;
    routePath?: string;
  }[];
  buttons?: ReactNode;
  children: ReactNode;
  className?: string;
}
export default function NewPageLayout({ title, menu, buttons, children, className = "mx-auto grid  md:max-w-[1280px] gap-5 pr-4 pl-12 py-5 sm:pr-8 sm:pl-12 mt-[12px] lg:pr-[75px] lg:pl-28" }: Props) {
  return (
    <div className={className}>
      <div className="space-y-1 ml-[-32px]">
        {menu && <BreadcrumbCustom menu={menu} />}
        <div className="flex items-center justify-between space-x-2 pt-3">
          <h1 className="flex flex-1 items-center truncate text-lg font-normal text-[#121212]">{title}</h1>
          <div className="flex items-center space-x-2">{buttons}</div>
        </div>
      </div>

      {children}
    </div>
  );
}
