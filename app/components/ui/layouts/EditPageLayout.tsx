import { ReactNode, useState } from "react";
import { useParams } from "@remix-run/react";
import Tabs, { TabItem } from "../tabs/Tabs";
import clsx from "clsx";
import BreadcrumbCustom from "~/custom/components/breadcrumbs/Breadcrumb";
import ActionsBar from "~/custom/components/recruitment/actionsBar";

interface Props {
  title?: ReactNode;
  menu?: {
    title: string;
    routePath?: string;
  }[];
  buttons?: ReactNode;
  children: ReactNode;
  withHome?: boolean;
  tabs?: TabItem[];
  fullWidth?: boolean;
  className?: string;
  onSubmit?: any;
  options?: any;
  rowData?: any;
}

export default function EditPageLayout({ title, rowData, options, onSubmit, menu, buttons, children, withHome = true, tabs, fullWidth, className }: Props) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isActionOpen, setIsActionOpen] = useState(true);
  const params = useParams();
  const home = params.tenant ? `/app/${params.tenant}/dashboard` : "/admin/dashboard";
  const disableSideLayout = !(rowData?.entity?.hasTags || rowData?.entity?.hasTasks || rowData?.entity?.hasActivity);

  const toggleActionsBar = () => {
    setIsActionOpen(!isActionOpen);
  };

  return (
    <div
      className={clsx(
        className,
        "space-y-3 pl-4 sm:pl-6 lg:pl-6",
        disableSideLayout ? "pr-4 sm:pr-6 lg:pr-6" : "",
        fullWidth ? "w-full" : "max-w-[1920px]",
        ""
      )}
    >
      <div
        className={clsx(
          "grid w-full grid-cols-1 gap-4",
          isActionOpen
            ? "sm:grid-cols-6 md:grid-cols-5 lg:grid-cols-7"
            : "sm:grid-cols-[repeat(24,minmax(0,1fr))] md:grid-cols-[repeat(16,minmax(0,1fr))] lg:grid-cols-[repeat(20,minmax(0,1fr))]"
        )}
      >
        <div
          className={clsx(
            "flex flex-1 flex-col",
            disableSideLayout
              ? "sm:col-span-6 md:col-span-5 lg:col-span-7"
              : `${
                  isActionOpen
                    ? "sm:col-span-3 md:col-span-3 lg:col-span-5"
                    : "sm:[grid-column:span_22/span_22] md:[grid-column:span_15/span_15] lg:[grid-column:span_19/span_19]"
                }`
          )}
        >
          <div className={params.id ? "pt-8" : "space-y-1 pt-6"}>
            {menu && <BreadcrumbCustom home={withHome ? home : undefined} menu={menu} />}

            <div className="flex items-center justify-between space-x-2">
              <div className="flex items-center space-x-2">{buttons}</div>
            </div>

            {tabs && <Tabs tabs={tabs} className="flex-grow" />}
          </div>
          {children}
        </div>
        {rowData ? (
          <>
            <div className={clsx("absolute right-10 top-6 sm:hidden", disableSideLayout ? "hidden" : "block")}>
              <button className="flex items-center gap-1" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M2 12H10.6667V10.6667H2V12ZM2 8.66667H8.66667V7.33333H2V8.66667ZM2 4V5.33333H10.6667V4H2ZM14 10.3933L11.6133 8L14 5.60667L13.06 4.66667L9.72667 8L13.06 11.3333L14 10.3933Z"
                    fill="#291400"
                  />
                </svg>
                Actions
              </button>
            </div>
            <div className={clsx("flex flex-col ", isActionOpen ? "sm:col-span-3 md:col-span-2 lg:col-span-2" : "sm:col-span-2 md:col-span-1 lg:col-span-1")}>
              {isDrawerOpen && (
                <div className="fixed bottom-0 right-0 top-0 z-50 flex w-[calc(100%-72px)] items-center justify-center bg-black bg-opacity-50 sm:hidden">
                  <div className="h-full w-full overflow-auto bg-white p-4">
                    <div className="flex items-center justify-between">
                      <button onClick={() => setIsDrawerOpen(false)} className="fixed right-5 top-5 text-xl text-red-500">
                        &times;
                      </button>
                    </div>
                    <div className="mt-4">
                      <ActionsBar rowData={rowData} options={options} onSubmit={onSubmit} />
                    </div>
                  </div>
                </div>
              )}
              {params.id && (
                <div
                  className={clsx(
                    "hidden h-full min-h-screen w-full flex-shrink-0 border-l border-solid border-black border-opacity-10 bg-[#fbfbfb] py-6 pr-1 sm:block ",
                    isActionOpen ? "pl-4" : "p-0"
                  )}
                >
                  {!isActionOpen ? (
                    <div className="flex items-center justify-center">
                      <button onClick={toggleActionsBar}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
                          <path
                            d="M2 12H10.6667V10.6667H2V12ZM2 8.66667H8.66667V7.33333H2V8.66667ZM2 4V5.33333H10.6667V4H2ZM14 10.3933L11.6133 8L14 5.60667L13.06 4.66667L9.72667 8L13.06 11.3333L14 10.3933Z"
                            fill="#291400"
                          />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <ActionsBar rowData={rowData} options={options} onSubmit={onSubmit} onToggle={toggleActionsBar} />
                  )}
                </div>
              )}
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
