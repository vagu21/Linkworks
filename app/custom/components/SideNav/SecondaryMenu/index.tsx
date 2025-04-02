import clsx from "clsx";
import React, { useState } from "react";
import EntityIcon from "~/components/layouts/icons/EntityIcon";

interface NavMenuItemProps {
  icon: JSX.Element | null | undefined | React.ReactNode;
  label: JSX.Element | null | undefined | React.ReactNode;
  labelText?: string;
  active?: boolean;
  className?: string;
  isCollapsed?: boolean;
}

export function SecondaryNavMenuItem({ icon, label, labelText = "", active, className = "", isCollapsed = false }: NavMenuItemProps) {
  return (
    <section
      className={clsx(
        "flex w-full cursor-pointer items-center justify-between gap-2.5 whitespace-nowrap py-[7px]",
        className,
        isCollapsed ? "" : "",
        active ? "!cursor-pointer rounded-[9px] bg-[#FFEFC9] px-[4px] " : "px-[4px] "
      )}
      title={isCollapsed ? labelText : ""}
      aria-label={labelText}
    >
      <div className={clsx("my-auto aspect-square w-5 shrink-0 self-stretch object-contain ", isCollapsed && "translate-x-1")}>{icon ? icon : null}</div>
      <span
        className={clsx(
          "my-auto flex-1 shrink basis-0 self-stretch overflow-hidden text-ellipsis whitespace-nowrap",
          active && "font-medium text-stone-900",
          isCollapsed && "w-0 opacity-0"
        )}
      >
        {label}
      </span>
      {active && (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path
            d="M10.0026 3.33594L8.8276 4.51094L13.4776 9.16927H3.33594V10.8359H13.4776L8.8276 15.4943L10.0026 16.6693L16.6693 10.0026L10.0026 3.33594Z"
            fill="#291400"
          />
        </svg>
      )}
    </section>
  );
}

type SecondaryMenuProps = {
  title?: string;
  icon?: string;
  children: React.ReactNode;
  menuItems: ({ isCollapsed }: { isCollapsed: boolean }) => JSX.Element;
};

export default function SecondaryMenu({ title, icon, menuItems, children }: SecondaryMenuProps) {
  const [isCollapsed, setCollapse] = useState(false);

  return (
    <div className="flex flex-row">
      <section
        className={clsx(
          "h-screen w-full flex-shrink-0 border-r border-zinc-300 bg-transparent px-2 text-sm text-black transition-all",
          isCollapsed ? "max-w-12" : "max-w-52"
        )}
      >
        <header className="mb-7 flex h-20 w-full justify-between gap-5 whitespace-nowrap text-lg">
          {isCollapsed ? null : (
            <div className="flex-1">
              <div className={clsx("mt-7 flex flex-col items-start pl-2 w-full")}>
                <EntityIcon className="h-5 w-5 text-[#B7A89C]" icon={icon} />
          
                {/* <div
                  className={clsx("aspect-square w-5 object-contain text-[#B7A89C]", isCollapsed ? "" : "w-auto")}
                  dangerouslySetInnerHTML={{ __html: icon ? icon : "" }}
                /> */}
                <h1 className={clsx("mt-3 overflow-hidden text-ellipsis text-nowrap", isCollapsed ? "" : "max-w-36")}>{title}</h1>
              </div>
            </div>
          )}
          <div
            role="button"
            onClick={() => setCollapse((p) => !p)}
            className={clsx("my-auto aspect-square w-5 shrink-0 cursor-pointer object-contain", isCollapsed ? "ml-1" : "")}
          >
            {isCollapsed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M17.5 15H6.66667V13.3333H17.5V15ZM17.5 10.8333H9.16667V9.16667H17.5V10.8333ZM17.5 5V6.66667H6.66667V5H17.5ZM2.5 12.9917L5.48333 10L2.5 7.00833L3.675 5.83333L7.84167 10L3.675 14.1667L2.5 12.9917Z"
                  fill="#291400"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path
                  d="M2.5 15H13.3333V13.3333H2.5V15ZM2.5 10.8333H10.8333V9.16667H2.5V10.8333ZM2.5 5V6.66667H13.3333V5H2.5ZM17.5 12.9917L14.5167 10L17.5 7.00833L16.325 5.83333L12.1583 10L16.325 14.1667L17.5 12.9917Z"
                  fill="#291400"
                />
              </svg>
            )}
          </div>
        </header>
        <nav className={clsx("z-10 mt-0 w-full")}>
          <div className="gap-2 overflow-y-auto" style={{ height: "calc(100vh - 108px)" }} aria-hidden="true">
            {menuItems({ isCollapsed })}
          </div>
        </nav>
      </section>
      <section className="max-h-screen flex-1 overflow-y-auto">{children}</section>
    </div>
  );
}
