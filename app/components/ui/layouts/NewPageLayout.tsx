import { ReactNode } from "react";
import BreadcrumbSimple from "../breadcrumbs/BreadcrumbSimple";

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
export default function NewPageLayout({ title, menu, buttons, children, className = "mx-auto grid max-w-5xl gap-5 px-4 py-5 sm:px-8" }: Props) {
  return (
    <div className={className}>
      <div className="space-y-1">
        <div className="flex items-center justify-between space-x-2">
          <h1 className="flex flex-1 items-center truncate text-xl font-medium">{title}</h1>
          <div className="flex items-center space-x-2">{buttons}</div>
        </div>

        {menu && <BreadcrumbSimple menu={menu} />}
      </div>

      {children}
    </div>
  );
}
