import { Link, useLocation, useNavigate } from "@remix-run/react";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import UrlUtils from "~/utils/app/UrlUtils";

export interface TabItem {
  name: any;
  routePath?: string;
}

interface Props {
  className?: string;
  tabs: TabItem[];
  asLinks?: boolean;
  onSelected?: (idx: number) => void;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  exact?: boolean;
  selectedTab?: number;
}

export default function Tabs({ className = "", breakpoint = "md", tabs = [], asLinks = true, onSelected, exact, selectedTab = 0 }: Props) {
  const { t } = useTranslation();

  const navigate = useNavigate();
  const location = useLocation();

  const [selected, setSelected] = useState(selectedTab);

  useEffect(() => {
    tabs.forEach((tab, index) => {
      if (tab.routePath && (location.pathname + location.search).includes(tab.routePath)) {
        setSelected(index);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, location.pathname]);

  function selectTab(idx: number) {
    const tab = tabs[idx];
    setSelected(idx);
    if (asLinks) {
      if (tab?.routePath) {
        navigate(tab.routePath);
      }
    } else {
      if (onSelected) {
        onSelected(idx);
      }
    }
  }
  function isCurrent(idx: number) {
    return currentTab() === tabs[idx];
  }
  const currentTab = () => {
    if (asLinks) {
      if (true) {
        return tabs.find((element) => element.routePath && UrlUtils.stripTrailingSlash(location.pathname) === UrlUtils.stripTrailingSlash(element.routePath));
      } else {
        return tabs.find((element) => element.routePath && (location.pathname + location.search).includes(element.routePath));
      }
    } else {
      return tabs[selected];
    }
  };
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
          {t("app.shared.tabs.select")}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="focus:border-accent-500 focus:ring-accent-500 block w-full rounded-md border-gray-300"
          onChange={(e) => selectTab(Number(e.target.value))}
          value={selected}
        >
          {tabs.map((tab, idx) => {
            return (
              <option key={tab.name} value={Number(idx)}>
                {tab.name}
              </option>
            );
          })}
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
        {(() => {
          if (asLinks) {
            return (
              <nav className="flex space-x-4 mb-[12px]" aria-label="Tabs">
                {tabs
                  .filter((f) => f.routePath)
                  .map((tab, idx) => {
                    return (
                      <Link
                        key={tab.name}
                        to={tab.routePath ?? ""}
                        className={clsx(
                          "truncate",
                          isCurrent(idx) ? " text-secondary-foreground bg-[#F2F2F8]" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                          "rounded-sm px-3 py-2 text-sm font-medium"
                        )}
                      >
                        {tab.name}
                      </Link>
                    );
                  })}
              </nav>
            );
          } else {
            return (
              <nav className="flex space-x-4" aria-label="Tabs">
                {tabs.map((tab, idx) => {
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => selectTab(idx)}
                      className={clsx(
                        "truncate",
                        isCurrent(idx) ? " text-secondary-foreground bg-secondary" : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                        "rounded-sm px-3 py-2 text-sm font-medium"
                      )}
                    >
                      {tab.name}
                    </button>
                  );
                })}
              </nav>
            );
          }
        })()}
      </div>
    </div>
  );
}
