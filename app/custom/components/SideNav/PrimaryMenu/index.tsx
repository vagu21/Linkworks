import React, { useState } from "react";
import clsx from "clsx";
import { Link } from "@remix-run/react";

type MenuOptionProps = {
  icon: JSX.Element | null;
  label: JSX.Element | null;
  labelText?: string;
  variant?: "default" | "expanded" | "active";
  isCollapsed?: boolean;
};

export const PrimaryMenuOption: React.FC<MenuOptionProps> = ({ isCollapsed = false, icon, label, labelText, variant = "default" }) => {
  return (
    <section
      className={clsx(
        //
        "flex cursor-pointer flex-col justify-center whitespace-nowrap px-2 py-2.5  text-sm text-stone-800",
        {
          "text-opacity-75 hover:bg-[#FFEFC9]": variant === "default" || variant === "expanded",
          "bg-[#FFEFC9]": variant === "expanded",
          "bg-yellow-400 font-medium leading-5 text-opacity-100": variant === "active",
        },
        "mt-2 first:mt-0",
        isCollapsed ? "w-full min-w-[72px] rounded-lg" : "mx-auto min-h-10 w-10 min-w-10 rounded-[100px]"
      )}
      aria-label={labelText}
    >
      <div className={clsx("flex w-full items-center gap-2", isCollapsed ? "" : "justify-center")}>
        <div className="my-auto aspect-square w-5 shrink-0 self-stretch object-contain" aria-hidden="true">
          {icon ? icon : null}
        </div>
        {isCollapsed ? <span className="my-auto w-full self-stretch">{label}</span> : null}
      </div>
    </section>
  );
};

export const PrimaryMenuItemDivider = () => (
  <div role="listitem" aria-hidden="true" className="mb-2 flex w-full flex-col justify-center px-2 py-1.5">
    <div className="flex w-full items-center gap-2">
      <hr className="my-auto min-h-px w-full flex-1 shrink basis-0 self-stretch border border-solid border-black opacity-10" />
    </div>
  </div>
);

type PrimaryMenuProps = {
  layout: "app" | "admin" | "docs";
  logo: string;
  logoIcon: string | undefined;
  menuItems: ({ isCollapsed }: { isCollapsed: boolean }) => JSX.Element;
  footer: ({ isCollapsed }: { isCollapsed: boolean }) => JSX.Element;
  children: React.ReactNode;
};

const PrimaryMenu: React.FC<PrimaryMenuProps> = ({ layout, logo, logoIcon, menuItems, footer, children }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [fixed, setIsFixed] = useState(true);
  const isNavCollapsed = isCollapsed || !fixed;

  const onHover = () => {
    if(!fixed) return
    setIsCollapsed(true);
  };

  const onMouseLeave = () => {
    if(!fixed) return
    setIsCollapsed(false);
  };

  return (
    <div>
      <nav
        className={clsx(
          "z-20 flex w-full min-w-[72px] flex-col overflow-hidden border-r border-[#E6E6E6] pb-3 transition-all",
          isNavCollapsed ? "max-w-[220px] bg-[linear-gradient(180deg,#F8F7EE_0%,#FFFDF0_100%)]" : "max-w-[72px] bg-transparent",
          layout === "admin" ? "dark" : "dark",
          "fixed bottom-0 left-0 top-0"
        )}
      >
        <div className="w-full">
          {/* fix image height to 58px at max */}
          <header className="overflow-hidden border-b border-solid border-[#E6E6E6]">
            <Link to={"/"}>
              <img
                loading="lazy"
                src={logo}
                className={clsx("aspect-[2.75] h-[58px] max-h-[58px] w-full object-contain", !isNavCollapsed && "hidden")}
                alt="Menu header default"
              />
              <img
                loading="lazy"
                src={logoIcon}
                className={clsx("aspect-[0.9] h-[58px] max-h-[58px] w-full object-contain", isNavCollapsed && "hidden")}
                alt="Menu header collapsed"
              />
            </Link>
          </header>
          <button type="button" onClick={() => setIsFixed((p) => !p)} className="flex h-[28px] w-full items-center justify-center bg-[#FFEFC9] px-3">
            {fixed ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M14 12H5.33333V10.6667H14V12ZM14 8.66667H7.33333V7.33333H14V8.66667ZM14 4V5.33333H5.33333V4H14ZM2 10.3933L4.38667 8L2 5.60667L2.94 4.66667L6.27333 8L2.94 11.3333L2 10.3933Z"
                  fill="#FF7800"
                />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 12H10.6667V10.6667H2V12ZM2 8.66667H8.66667V7.33333H2V8.66667ZM2 4V5.33333H10.6667V4H2ZM14 10.3933L11.6133 8L14 5.60667L13.06 4.66667L9.72667 8L13.06 11.3333L14 10.3933Z"
                  fill="#FF7800"
                />
              </svg>
            )}
          </button>
          <div
            role="list"
            onMouseEnter={onHover}
            onMouseLeave={onMouseLeave}
            className={clsx("w-full overflow-y-auto overflow-x-hidden px-3 pt-[10px]", {
              "max-h-[calc(100vh_-_58px-28px-150px)]": layout === "app",
              "max-h-[calc(100vh_-_58px-12px-0px)] pb-[20px]": layout === "admin",
            })}
          >
            {menuItems({ isCollapsed: isNavCollapsed })}
          </div>
        </div>
        <section className="mt-auto flex w-full flex-shrink-0 flex-col items-start px-3">{footer({ isCollapsed: isNavCollapsed })}</section>
      </nav>
      <div className={clsx("transition-all", fixed ? "pl-[72px]" : "overflow-y-auto overflow-x-hidden pl-[220px]")}>{children}</div>
    </div>
  );
};

export default PrimaryMenu;