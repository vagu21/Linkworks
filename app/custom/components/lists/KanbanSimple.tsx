import clsx from "clsx";
import { Fragment, ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";

export type KanbanColumn<T> = {
    name: string;
    title: string | ReactNode;
    color?: Colors;
    value: (item: T) => any;
    onClick?: (item: T) => void;
    onClickRoute?: (item: T) => string;
    onNewRoute?: (columnValue: string) => string;
};

interface Props<T> {
    columns: KanbanColumn<T>[];
    column: string;
    items: T[];
    filterValue: (item: T, column: KanbanColumn<T> | null) => boolean;
    undefinedColumn?: KanbanColumn<T>;
    className?: string;
    renderEmpty?: ReactNode;
    classNameWidth?: string;
}

export default function KanbanSimple<T>({ columns, items, column, filterValue, undefinedColumn, className, renderEmpty, classNameWidth }: Props<T>) {
    function getItems(column: KanbanColumn<T> | null) {
        return items.filter((f: T) => filterValue(f, column));
    }
    return (
        <div>
            <div className={clsx(className, "flex flex-row gap-5 overflow-x-auto px-3")}>
                {undefinedColumn && getItems(null).length > 0 && (
                    <KanbanColumnCard idx={0} key={column.length} items={getItems(null)} columns={columns} column={undefinedColumn} classNameWidth={classNameWidth} />
                )}
                <Fragment>
                    {columns.map((column, idx) => {
                        return <KanbanColumnCard idx={idx + 1} key={idx + 1} items={getItems(column)} columns={columns} column={column} classNameWidth={classNameWidth} />;
                    })}
                </Fragment>
            </div>
            {items.length === 0 && renderEmpty && <Fragment>{renderEmpty}</Fragment>}
        </div>
    );
}

interface KanbanColumnCardProps<T> {
    idx: number;
    columns: KanbanColumn<T>[];
    column: KanbanColumn<T>;
    items: T[];
    classNameWidth?: string;
}
function KanbanColumnCard<T>({ idx, columns, column, items, classNameWidth }: KanbanColumnCardProps<T>) {
    const { t } = useTranslation();

    const [isScrolled, setIsScrolled] = useState(false);
    const handleScroll = (event: React.UIEvent) => {
        const { scrollTop, scrollHeight, clientHeight } = event.currentTarget;
        if (scrollTop + clientHeight >= scrollHeight) {
            setIsScrolled(true);
        } else {
            setIsScrolled(false);
        }
    };
    return (
      <article className="flex flex-col">
        <section className="overflow-hidden rounded-xl border border-[#E4E7EC] bg-[rgba(248,247,239,0.5)]">
          <div
            className={clsx(
              "max-[769px]:max-h[400px] relative flex max-h-[485px] w-full flex-col items-center overflow-y-auto overflow-x-clip",
              items.length <= 2 && "min-h-[485px]"
            )}
            onScroll={handleScroll}
          >
            <header
              className={clsx(
                "sticky top-0 z-20 flex w-full min-w-[252px] items-center gap-2.5 border-b border-[#E4E7EC] bg-[rgba(248,247,239,0.5)] px-4 py-2 backdrop-blur-md",
                isScrolled && "bg-white"
              )}
            >
              <div className="my-auto flex flex-1 shrink basis-0 items-center gap-2 self-stretch">
                <div>
                  <span className="my-auto self-stretch">{column?.title ?? t("shared.undefined")}</span>
                </div>
                <div>
                  <span className="my-auto gap-1 self-stretch rounded border border-solid border-[#E4E7EC] bg-[rgba(0,0,0,0.02)] px-2 py-px text-xs font-normal leading-loose text-[#152C5B]">
                    {items.length}
                  </span>
                </div>
              </div>
              <div>
                {column?.onNewRoute && (
                  <Link
                    className="flex w-full items-center justify-center rounded-md border border-[#E4E7EC]  bg-[#FFF] text-center text-xs  font-medium shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)]"
                    to={column.onNewRoute(column.name)}
                  >
                    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M20.6668 16.6667H16.6668V20.6667H15.3335V16.6667H11.3335V15.3333H15.3335V11.3333H16.6668V15.3333H20.6668V16.6667Z"
                        fill="#152C5B"
                      />
                    </svg>
                  </Link>
                )}
              </div>
            </header>
            <main className="w-full px-4">
              <div className="flex w-auto max-w-full flex-col">
                {items.map((item, idx) => {
                  return (
                    <div key={idx} className="group w-auto max-w-full text-left">
                      {column?.onClickRoute ? (
                        <Link to={column.onClickRoute(item)} className="block w-auto max-w-full">
                          {column.value(item)}
                        </Link>
                      ) : (
                        <button type="button" onClick={() => column?.onClick && column?.onClick(item)} className="w-auto max-w-full">
                          {column.value(item)}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>
            {items.length === 0 && (
              <div className="flex h-[485px] flex-col items-center justify-center gap-4 text-center max-[769px]:h-[400px]">
                <div>
                  <svg width="68" height="42" viewBox="0 0 68 42" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M9.6976 29.5043C3.8106 30.8254 0.187988 32.6251 0.187988 34.6086C0.187988 38.6631 15.3261 41.95 34 41.95C52.6738 41.95 67.8119 38.6631 67.8119 34.6086C67.8119 32.6251 64.1893 30.8254 58.3023 29.5043V32.7047C58.3023 34.9312 56.9076 36.7561 55.1853 36.7561H12.8146C11.0923 36.7561 9.6976 34.9302 9.6976 32.7047V29.5043Z"
                      fill="black"
                      fill-opacity="0.06"
                    />
                    <path
                      d="M44.1574 16.7569C44.1574 15.0736 45.2077 13.684 46.5105 13.6829H58.3025V32.7047C58.3025 34.9312 56.9077 36.7561 55.1854 36.7561H12.8148C11.0925 36.7561 9.69775 34.9302 9.69775 32.7047V13.6829H21.4897C22.7925 13.6829 23.8428 15.0705 23.8428 16.7538V16.7768C23.8428 18.4601 24.9047 19.8193 26.2064 19.8193H41.7938C43.0955 19.8193 44.1574 18.4475 44.1574 16.7642V16.7569V16.7569Z"
                      fill="black"
                      fill-opacity="0.04"
                      stroke="#E4E7EC"
                      stroke-width="0.367521"
                    />
                    <path
                      d="M58.3025 13.7987L47.582 1.73566C47.0674 0.913412 46.3161 0.41629 45.5247 0.41629H22.4755C21.6841 0.41629 20.9328 0.913412 20.4183 1.73461L9.69775 13.7998"
                      stroke="#E4E7EC"
                      stroke-width="0.367521"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex flex-col gap-1">
                    <div>
                      <p className="!text-base !font-normal !text-[#152C5B]"> {column?.title ?? t("shared.undefined")}</p>
                    </div>
                    <div>
                      <p className="text-sm text-[rgba(152,162,179,0.99)]">There is no data in this section.</p>
                    </div>
                  </div>
                </div>

                <div>
                  {column?.onNewRoute && (
                    <button
                      className={`flex flex-col items-center justify-center rounded bg-[#FAAD14]  px-2 py-1 shadow-[0px_var(--Components-Button-Global-controlOutlineWidth,2px)_0px_0px_var(--Components-Button-Global-controlOutline,rgba(5,145,255,0.10))]`}
                    >
                      <Link to={column.onNewRoute(column.name)}>
                        <div className="flex items-center justify-center gap-2">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path
                              d="M12.6668 8.66665H8.66683V12.6666H7.3335V8.66665H3.3335V7.33331H7.3335V3.33331H8.66683V7.33331H12.6668V8.66665Z"
                              fill="#151B21"
                            />
                          </svg>

                          <p className="my-auto self-stretch text-xs font-normal leading-6 text-[#151B21]">Add New</p>
                        </div>
                      </Link>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </article>
    );
}
