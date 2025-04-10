import clsx from "clsx";
import { useTranslation } from "react-i18next";
import { useNavigate, useSearchParams } from "@remix-run/react";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";
import React, { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { RowHeaderActionDto } from "~/application/dtos/data/RowHeaderActionDto";
import ButtonTertiary from "~/components/ui/buttons/ButtonTertiary";
import DownArrow from "~/components/ui/icons/DownArrow";
import UpArrow from "~/components/ui/icons/UpArrow";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import { Checkbox } from "~/components/ui/checkbox";
import TablePagination from "~/components/ui/tables/TablePagination";
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import SortTableIcon from "~/components/ui/icons/SortTableIcon";
import searchNotFound from "~/assets/custom-images/Search_Not_Found.svg";
import noDataFound from "~/assets/custom-images/No_Data_Found.svg";
import filtersNotFound from "~/assets/custom-images/Filters_Not_Found.svg";
import AddButton from "../button/AddButton";
import UserCard from "./ItemDetails";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { usePopper } from "react-popper";

interface Props<T> {
  headers: RowHeaderDisplayDto<T>[];
  items: T[];
  entity: EntityWithDetails;
  actions?: RowHeaderActionDto<T>[];
  pagination?: PaginationDto;
  onClickRoute?: (idx: number, item: T) => string | undefined;
  selectedRows?: T[];
  onSelected?: (item: T[]) => void;
  className?: (idx: number, item: T) => string;
  padding?: string;
  noRecords?: ReactNode;
  emptyState?: { title: string; description: string; icon?: ReactNode };
  darkMode?: boolean;
  searchInput?: string;
  entityTitle?: string;
  onNewRow?: () => void;
  permissionCreate?: boolean;
}

export default function DataTable<T>(props: Props<T>) {
  const [showChild, setShowChild] = useState(false);

  useEffect(() => {
    setShowChild(true);
  }, []);

  if (!showChild) {
    return null;
  }

  return <Table {...props} />;
}

function Table<T>({
  headers,
  items,
  entity,
  actions = [],
  pagination,
  onClickRoute,
  selectedRows,
  onSelected,
  className,
  padding = "px-3 py-3",
  noRecords,
  emptyState,
  darkMode,
  searchInput,
  entityTitle,
  onNewRow,
  permissionCreate,
}: Props<T>) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [sortBy, setSortBy] = useState<{ by: string; order: "asc" | "desc" }[]>([]);
  const [currentSortBy, setCurrentSortBy] = useState<"asc" | "desc" | null | undefined>(null);
  const [tableItems, setTableItems] = useState<Array<T>>([]);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => {
    let sort = searchParams.get("sort");
    const sortArray = sort?.split(",") ?? [];
    const sortObject = sortArray.map((s) => {
      let order: "asc" | "desc" = "asc";
      if (s.startsWith("-")) {
        order = "desc";
      }
      return { by: s.replace("-", ""), order };
    });
    setSortBy(sortObject);
  }, [searchParams]);

  function toggleSelected(_: number, item: T) {
    if (!selectedRows || !onSelected) {
      return;
    }
    if (selectedRows.includes(item)) {
      onSelected(selectedRows.filter((i) => i !== item));
    } else {
      onSelected([...selectedRows, item]);
    }
  }

  const checkbox = useRef(null);
  const [checked, setChecked] = useState(false);
  const [indeterminate, setIndeterminate] = useState(false);
  const [referenceElement, setReferenceElement] = useState<HTMLElement | null>(null);
  const [popperElement, setPopperElement] = useState<HTMLElement | null>(null);
  const [isHoveringCard, setIsHoveringCard] = useState<boolean>(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { styles, attributes } = usePopper(referenceElement, popperElement, {
    placement: "right",
    modifiers: [
      {
        name: "preventOverflow",
        options: {
          boundary: "window",
        },
      },
    ],
  });
  const [isScrolled, setIsScrolled] = useState(false);

  const handleScroll = (event:any) => {
    const { scrollLeft } = event.target;
    setIsScrolled(scrollLeft > 0);
  };

  useLayoutEffect(() => {
    if (!selectedRows || !onSelected) {
      return;
    }
    const isIndeterminate = selectedRows.length > 0 && selectedRows.length < items.length;
    setChecked(selectedRows.length === items.length && items.length > 0);
    setIndeterminate(isIndeterminate);
    // @ts-ignore
    checkbox.current.indeterminate = isIndeterminate;
  }, [items.length, onSelected, selectedRows]);

  function toggleAll() {
    if (!selectedRows || !onSelected) {
      return;
    }
    onSelected(checked || indeterminate ? [] : items);
    setChecked(!checked && !indeterminate);
    setIndeterminate(false);
  }

  function onHeaderClick(header: RowHeaderDisplayDto<T>) {
    if (!header.sortBy) {
      return;
    }
    let currentSort = sortBy?.find((s) => s.by === header.sortBy);
    let newSort = header.sortBy;
    if (currentSort?.order === "asc") {
      newSort = `-${header.sortBy}`;
    }
    searchParams.set("sort", newSort);
    setSearchParams(searchParams);
  }

  function getSortDirection(header: RowHeaderDisplayDto<T>) {
    if (!header.sortBy) {
      return;
    }
    let currentSort = sortBy?.find((s) => s.by === header.sortBy);
    if (!currentSort) {
      return;
    }
    return currentSort.order;
  }

  const handleSort = useCallback(
    (order: "asc" | "desc" | "none", columnName?: string,type?:number) => {
      let sorted = [...items];

      const getTextValue = (item: any) => {
        const target = item?.values?.find((v: any) => v?.propertyId === columnName);
        if (!target) return "";

        switch (type) {
          case 0:
            return target.numberValue?.toString?.() || "";
          case 1:
            return target.textValue?.toLowerCase?.() || "";
          case 2:
            return new Date(target.dateValue)?.toISOString?.() || "";
          case 10:
            return target.booleanValue !== undefined ? target.booleanValue.toString() : "";
          default:
            return "";
        }
      };

      if (order === "asc") {
        sorted.sort((a, b) => {
          const aValue = getTextValue(a);
          const bValue = getTextValue(b);
          return aValue.localeCompare(bValue);
        });
        if (JSON.stringify(sorted) === JSON.stringify(items)) {
          setCurrentSortBy("asc");
        } else {
          setCurrentSortBy(null);
        }
      } else if (order === "desc") {
        sorted.sort((a, b) => {
          const aValue = getTextValue(a);
          const bValue = getTextValue(b);
          return bValue.localeCompare(aValue);
        });
        if (JSON.stringify(sorted) === JSON.stringify(items)) {
          setCurrentSortBy("desc");
        } else {
          setCurrentSortBy(null);
        }
      } else if (order === "none") {
        sorted = [...items];
        setCurrentSortBy(null);
      }

      setTableItems([...sorted]);
    },
    [items]
  );

  useEffect(() => {
    if (currentSortBy) {
      handleSort(currentSortBy);
    } else {
      setTableItems(items);
    }
  }, [currentSortBy, handleSort, items]);

  return (
    <div
      className={clsx(
        "w-full",
        "overflow-hidden",

        darkMode && ""
      )}
    >
      <div className="relative flex flex-col">
        <div className="relative h-[calc(100vh-320px)] w-full overflow-x-auto overflow-y-auto" onScroll={handleScroll}>
          <table className="whitespace-no-wrap w-full table-fixed border-separate border-spacing-0">
            <thead
              className={clsx(
                "!text-xs  text-black text-opacity-60",
                "font-bold",
                "w-full",

                darkMode && ""
              )}
            >
              <tr className={clsx("tracking-wide", darkMode && "")}>
                {actions.filter((f) => f.firstColumn).length > 0 && <th scope="col" className="px-2 py-1"></th>}
                {onSelected && (
                  <th scope="col" className="relative w-10 border-b-2 border-t-2 border-[#eaeaea] px-3 py-3 sm:px-6">
                    <Checkbox
                      title="Select all"
                      ref={checkbox}
                      className="text-primary-foreground focus:ring-ring border-border absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded sm:left-6"
                      checked={checked}
                      onCheckedChange={toggleAll}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </th>
                )}
                {headers
                  .filter((f) => !f.hidden)
                  .map((header, idxHeader) => {
                    const isSortable = header?.property?.isSortable;
                    return (
                      <th
                        key={idxHeader}
                        scope="col"
                        onClick={() => onHeaderClick(header)}
                        className={clsx(
                          "whitespace-nowrap px-3 py-3 pr-0 tracking-wider",
                          "border-b-2 border-t-2 border-[#eaeaea]",
                          "sticky top-0 z-10  bg-white/75 text-left text-sm font-semibold text-gray-900 backdrop-blur backdrop-filter",
                          header.breakpoint === "sm" && "hidden sm:table-cell",
                          header.breakpoint === "md" && "mg:table-cell hidden",
                          header.breakpoint === "lg" && "hidden lg:table-cell",
                          header.breakpoint === "xl" && "hidden xl:table-cell",
                          header.breakpoint === "2xl" && "hidden 2xl:table-cell",

                          header.sortBy && "cursor-pointer",
                          idxHeader == 0 && "sticky left-0 z-20 bg-white",
                          idxHeader === headers.length - 1 && "sticky right-0 z-20 !w-20 bg-inherit",
                          idxHeader === headers.length - 1 && entityTitle === "Job" && "!w-32",
                          "w-48 "
                        )}
                      >
                        <div className="flex flex-row items-center justify-between gap-2">
                          <div className="mt-[0px]">
                            <div className="group flex">
                              <div className="truncate">{t(header.title)}</div>
                              {header.sortBy && (
                                <div className="text-muted-foreground group-hover:text-foreground">
                                  {getSortDirection(header) === "desc" ? (
                                    <DownArrow className="h-4 w-4" />
                                  ) : (
                                    getSortDirection(header) === "asc" && <UpArrow className="h-4 w-4" />
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <div
                            className={clsx({
                              "h-[28px] border-r-[2px] border-[#eaeaea]": idxHeader < headers.length - 1,
                            })}
                          >
                            {isSortable && (
                              <SortDropdown
                                onSort={(order) => handleSort(order, header.property?.id || "", header.property?.type || 1)}
                                type={header.property?.type || 1}
                              />
                            )}
                          </div>
                        </div>
                      </th>
                    );
                  })}
                {actions.filter((f) => !f.firstColumn).length > 0 && <th scope="col" className="px-2 py-1"></th>}
              </tr>
            </thead>
            <tbody className={clsx("divide-divide divide-y border-b-2 border-[#eaeaea]", tableItems.length === 0 && "m-auto h-[50vh]", darkMode && "")}>
              {tableItems.length === 0 ? (
                <tr className={clsx("h-full border-b-2 border-[#eaeaea]", darkMode && "")}>
                  <td colSpan={headers.filter((f) => !f.hidden).length + actions.length + (onSelected ? 1 : 0)} className="h-full text-center align-middle">
                    {noRecords ?? (
                      <div className="text-muted-foreground flex h-full flex-col items-center justify-center p-3 text-sm">
                        {!emptyState ? (
                          searchInput ? (
                            <div className="flex h-full w-full flex-col items-center justify-center">
                              <img alt={"no search result"} src={searchNotFound} />
                              <p className="headings">{t("shared.noSearch", { searchInput })}</p>
                            </div>
                          ) : searchParams.size ? (
                            <div className="flex h-full flex-col items-center justify-center">
                              <img alt={"no filter result"} src={filtersNotFound} />
                              <p className="headings">{t("shared.noFilters")}</p>
                            </div>
                          ) : (
                            <div className=" flex flex-col items-center justify-center gap-5">
                              <img alt={"no data found"} src={noDataFound} />
                              <span className="headings">{t("shared.noDataRecords")}</span>
                              <AddButton
                                label={<span className="sm:text-sm">{`+ Add New ${entityTitle}`}</span>}
                                onClick={onNewRow}
                                disabled={!permissionCreate}
                                to={!onNewRow ? "new" : undefined}
                              />
                            </div>
                          )
                        ) : (
                          <div className="space-y-1">
                            <div className="font-medium">{emptyState.title}</div>
                            <div>{emptyState.description}</div>
                          </div>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ) : (
                tableItems.map((item, idxRow) => {
                  const href = onClickRoute?.(idxRow, item);
                  return (
                    <tr className={clsx("bg-white hover:bg-[#f9f9f9]", darkMode && "")} key={idxRow} onClick={href ? (e) => navigate(href) : undefined}>
                      <ActionsCells actions={actions.filter((f) => f.firstColumn)} className={className} item={item} idxRow={idxRow} />
                      {onSelected && (
                        <td className="relative w-10 border-b-2 border-[#eaeaea] px-6 sm:w-12 sm:px-6">
                          {selectedRows?.includes(item) && <div className="bg-primary absolute inset-y-0 left-0 w-0.5" />}
                          <div className="flex items-center space-x-1">
                            <Checkbox
                              title="Select"
                              className="text-primary-foreground focus:ring-ring border-border absolute left-4 top-1/2 -mt-2 h-4 w-4 rounded sm:left-6"
                              checked={selectedRows?.includes(item)}
                              onCheckedChange={(e) => toggleSelected(idxRow, item)}
                              onClick={(e) => e.stopPropagation()}
                            />
                          </div>
                        </td>
                      )}
                      {headers
                        .filter((f) => !f.hidden)
                        .map((header, idxHeader) => (
                          <td
                            key={idxHeader}
                            style={
                              (idxHeader === 0 || idxHeader === headers.length - 1) && isScrolled
                                ? {
                                    boxShadow: "10px 0px 15px -5px rgba(181, 181, 181, 0.25)",
                                  }
                                : {}
                            }
                            className={clsx(
                              "text-text-strong cursor-pointer whitespace-nowrap border-b-2 border-[#eaeaea] text-sm font-normal ",
                              idxHeader == 0 && "sticky left-0 bg-inherit",
                              idxHeader === headers.length - 1 && "sticky right-0 z-10  bg-inherit",
                              idxHeader === headers.length - 1 && entityTitle === "Job" && "!w-32",
                              padding,
                              "w-48"
                            )}
                            ref={(el) => hoveredRow === idxRow && idxHeader === 0 && setReferenceElement(el)}
                            onMouseEnter={
                              idxHeader === 0
                                ? () => {
                                    if (hideTimeoutRef.current) {
                                      clearTimeout(hideTimeoutRef.current);
                                    }
                                    setHoveredRow(idxRow);
                                  }
                                : undefined
                            }
                            onMouseLeave={
                              idxHeader === 0
                                ? () => {
                                    hideTimeoutRef.current = setTimeout(() => {
                                      if (!isHoveringCard) {
                                        setHoveredRow(null);
                                      }
                                    }, 200);
                                  }
                                : undefined
                            }
                          >
                            {RowDisplayValueHelper.displayRowValue(t, header, item, idxRow)}
                          </td>
                        ))}
                      <ActionsCells actions={actions.filter((f) => !f.firstColumn)} className={className} item={item} idxRow={idxRow} />
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-auto border-t-2 border-[#F0F0F0]">
          {pagination && (
            <div className="">
              <TablePagination totalItems={pagination.totalItems} totalPages={pagination.totalPages} page={pagination.page} pageSize={pagination.pageSize} />
            </div>
          )}
        </div>
      </div>
      {hoveredRow !== null &&
        (() => {
          const systemView: any = entity.views.find((f) => f.isSystem);
          const systemViewProperties = systemView?.properties;

          if (systemView) {
            entity.properties?.forEach((property) => {
              const systemViewProperty = systemViewProperties?.find((f: any) => f?.propertyId === property.id);
              property.isHidden = !systemViewProperty;
            });
          }

          const propertyIds = systemViewProperties?.reduce((acc: any, item: any) => {
            acc[item.name] = item?.propertyId;
            return acc;
          }, {} as Record<string, string>);

          const extractedValues = Object.fromEntries(
            Object.entries(propertyIds || {}).map(([key, id]) => [
              key,
              tableItems[hoveredRow]?.values.find((val: { propertyId: string }) => val?.propertyId === id)?.textValue || "N/A",
            ])
        );
        const href = onClickRoute?.(hoveredRow, tableItems[hoveredRow]);
          return (
            <div
              ref={setPopperElement}
              style={{
                ...styles.popper,
              }}
              {...attributes.popper}
              className="absolute z-50"
              onMouseEnter={() => {
                if (hideTimeoutRef.current) {
                  clearTimeout(hideTimeoutRef.current);
                }
                setIsHoveringCard(true);
              }}
              onMouseLeave={() => {
                setIsHoveringCard(false);
                hideTimeoutRef.current = setTimeout(() => {
                  setHoveredRow(null);
                }, 200);
              }}
            >
              <UserCard data={extractedValues} entity={entity} item={tableItems[hoveredRow]} onClick={href ? (e) => navigate(href) : undefined} />
            </div>
          );
        })()}

      {/* {pagination && <TablePagination totalItems={pagination.totalItems} totalPages={pagination.totalPages} page={pagination.page} pageSize={pagination.pageSize} />} */}
    </div>
  );
}

const SortDropdown = React.memo(function SortDropdown({ onSort, type }: { onSort: (order: "asc" | "desc" | "none") => void; type: number }) {
  const getLabel = (order: "asc" | "desc") => {
    switch (type) {
      case 0:
        return order === "asc" ? "Low to High" : "High to Low";
      case 1:
        return order === "asc" ? "A to Z" : "Z to A";
      case 2:
        return order === "asc" ? "Oldest First" : "Newest First";
      case 10:
        return order === "asc" ? "True First" : "False First";
      default:
        return order === "asc" ? "Asc" : "Desc";
    }
  };

  return (
    <div className="relative !z-50">
      <Menu>
        <MenuButton className="p-2">
          <SortTableIcon />
        </MenuButton>
        <MenuItems className="absolute right-0 !z-40 mt-3 w-32 rounded-lg border bg-white p-1 shadow-lg">
          <MenuItem>
            {({ active }) => (
              <button className={`!z-40 block w-full px-4 py-3 text-left text-sm ${active ? "rounded-md bg-[#FFEFC9]" : ""}`} onClick={() => onSort("asc")}>
                {getLabel("asc")}
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button className={`!z-40 block w-full px-4 py-3 text-left text-sm ${active ? "rounded-md bg-[#FFEFC9]" : ""}`} onClick={() => onSort("desc")}>
                {getLabel("desc")}
              </button>
            )}
          </MenuItem>
          <MenuItem>
            {({ active }) => (
              <button className={`!z-40 block w-full px-4 py-3 text-left text-sm ${active ? "rounded-md bg-[#FFEFC9]" : ""}`} onClick={() => onSort("none")}>
                Reset Sort
              </button>
            )}
          </MenuItem>
        </MenuItems>
      </Menu>
    </div>
  );
})


function ActionsCells<T>({
  item,
  actions,
  idxRow,
  className,
}: {
  item: T;
  actions: RowHeaderActionDto<T>[];
  idxRow: number;
  className?: (idx: number, item: T) => string;
}) {
  // const { t } = useTranslation();
  const refConfirm = useRef<RefConfirmModal>(null);
  function onConfirmed({ action, item }: { action: RowHeaderActionDto<T>; item: T }) {
    if (action.onClick) {
      action.onClick(idxRow, item);
    }
  }
  return (
    <>
      {actions.length > 0 && (
        <td className={clsx("whitespace-nowrap px-2 py-1", className && className(idxRow, item))}>
          <div className="flex space-x-2">
            {actions.map((action, idx) => (
              <ButtonTertiary
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (action.onClick) {
                    action.onClick(idxRow, item);
                  }
                }}
              >
                {action.title}
              </ButtonTertiary>
            ))}
          </div>
        </td>
      )}
      <ConfirmModal ref={refConfirm} onYes={onConfirmed} />
    </>
  );
}
