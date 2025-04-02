import { Link, useNavigate } from "@remix-run/react";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type TabWithIcon = {
  name?: string;
  href?: string;
  current: boolean;
  icon?: ReactNode;
  onClick?: () => void;
  className?: string;
};
interface Props {
  tabs: TabWithIcon[];
  className?: string;
  justify?: "start" | "center" | "end" | "between";
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
}
export default function TabsWithIcons({ tabs, className, justify, breakpoint = "md" }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  return (
    <div className={className}>
      <div
        className={clsx(
          breakpoint === "sm" && "sm:hidden",
          breakpoint === "md" && "md:hidden",
          breakpoint === "lg" && "lg:hidden",
          breakpoint === "xl" && "xl:hidden",
          breakpoint === "2xl" && "2xl:hidden"
        )}
      >
        <label htmlFor="tabs" className="sr-only">
          {t("shared.select")}
        </label>
        {/* Use an "onChange" listener to redirect the user to the selected tab URL. */}
        <select
          id="tabs"
          name="tabs"
          // className="block w-full rounded-md border-gray-300 focus:border-accent-500 focus:ring-accent-500"
          className="block w-full rounded-md border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300"

          value={tabs.find((tab) => tab.current)?.name}
          onChange={(e) => {
            const tab = tabs.find((tab) => tab.name === e.target.value);
            if (tab?.href) {
              navigate(tab.href);
            } else if (tab?.onClick) {
              tab.onClick();
            }
          }}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.name}>
              {tab.name}
            </option>
          ))}
        </select>
      </div>
      <div
        className={clsx(
          breakpoint === "sm" && "hidden sm:block",
          breakpoint === "md" && "hidden md:block",
          breakpoint === "lg" && "hidden lg:block",
          breakpoint === "xl" && "hidden xl:block",
          breakpoint === "2xl" && "hidden 2xl:block"
        )}
      >
        {/* <div className="border-b border-border"> */}
        <div className="w-full  border-[#F0F0F0]">
          <nav
            className={clsx(
              "-mb-px flex space-x-8 w-full",
              justify === "start" && "justify-start",
              justify === "center" && "justify-center",
              justify === "end" && "justify-end",
              justify === "between" && "justify-between"
            )}
            aria-label="Tabs"
          >
            {tabs.map((tab, idx) => (
              <Fragment key={idx}>
                {tab.href && (
                  <Link
                    key={tab.name}
                    to={tab.href}
                    className={clsx(
                      tab.current ? "border-b-2 border-[#151B21] text-[#151B21] text-xs font-semibold" : "border-b-2 font-normal border-transparent text-xs text-[rgba(0,0,0,0.60)] text-opacity-5 ",
                      "group inline-flex  w-full   items-center space-x-2 border-b-2 px-1 py-4 text-xs font-normal transition-colors duration-200",
                      tab.className
                    )}
                    aria-current={tab.current ? "page" : undefined}
                  >
                    {tab.icon}
                    <div className="truncate">{tab.name}</div>
                  </Link>
                )}
                {tab.onClick && (
                  <button
                    type="button"
                    onClick={tab.onClick}
                    className={clsx(
                      tab.current ? "border-b-2 border-[#151B21] text-[#151B21] text-xs  font-semibold " : "border-b-2 border-transparent font-normal text-xs text-[rgba(0,0,0,0.60)] text-opacity-5",
                      "group inline-flex w-full items-center space-x-2 border-b-2 px-1 py-4 text-xs font-normal transition-colors duration-200",
                      tab.className
                    )}
                    aria-current={tab.current ? "page" : undefined}
                  >
                    {tab.icon}
                    <div className="truncate">{tab.name}</div>
                  </button>
                )}
              </Fragment>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}