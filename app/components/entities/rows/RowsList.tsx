import RowsListAndTable from "./RowsListAndTable";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { PaginationDto } from "~/application/dtos/data/PaginationDto";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { KanbanColumn } from "~/components/ui/lists/KanbanSimple";
import RowHelper from "~/utils/helpers/RowHelper";
import { useTranslation } from "react-i18next";
import { Colors } from "~/application/enums/shared/Colors";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "@remix-run/react";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import GridContainer from "~/components/ui/lists/GridContainer";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import clsx from "clsx";
import EntityViewHelper from "~/utils/helpers/EntityViewHelper";
import RowColumnsHelper from "~/utils/helpers/RowColumnsHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import EmptyState from "~/components/ui/emptyState/EmptyState";
import RenderCard from "./RenderCard";
import RowsLoadMoreCard from "~/components/ui/tables/RowsLoadMoreCard";
import KanbanSimple from "~/custom/components/lists/KanbanSimple";
import { createPortal } from "react-dom";
// import { DeleteConfirmationPopup } from "~/custom/components/relationDeletePopup/DeleteConfirmationPopup";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import { DeleteConfirmationPopup } from "~/custom/components/relationDeletePopup/DeleteConfirmationPopup";
import RelationCardMenu from "~/custom/components/RelationCardMenu/RelationCardMenu";

interface Props {
  view: "table" | "board" | "grid" | "card";
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  pagination?: PaginationDto;
  onEditRow?: (row: RowWithDetails) => void;
  currentView?: EntityViewWithDetails | null;
  selectedRows?: RowWithDetails[];
  onSelected?: (item: RowWithDetails[]) => void;
  readOnly?: boolean;
  onClickRoute?: (row: RowWithDetails) => string;
  onRemove?: (row: RowWithDetails) => void;
  ignoreColumns?: string[];
  columns?: ColumnDto[];
  actions?: (row: RowWithDetails) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
  leftHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  rightHeaders?: RowHeaderDisplayDto<RowWithDetails>[];
  searchInput?: string;
  entityTitle?: string;
  onNewRow?: () => void;
  permissionCreate?: boolean;
}
export default function RowsList(props: Props & { entity: EntityWithDetails | string }) {
  const appOrAdminData = useAppOrAdminData();

  const [entity, setEntity] = useState<EntityWithDetails>();
  const [columns, setColumns] = useState<ColumnDto[]>([]);
  const [groupBy, setGroupBy] = useState<{ property?: PropertyWithDetails } | undefined>();

  useEffect(() => {
    let entity: EntityWithDetails | undefined = undefined;
    let columns: ColumnDto[] = [];
    let groupBy: { property?: PropertyWithDetails } | undefined = undefined;

    if (typeof props.entity === "string") {
      entity = appOrAdminData.entities.find((e) => e.name === props.entity);
    } else {
      entity = props.entity;
    }

    if (entity) {
      const systemView = entity.views.find((f) => f.isSystem);
      let view = props.currentView ?? systemView;
      if (!view) {
        columns = RowColumnsHelper.getDefaultEntityColumns(entity);
        if (props.view === "board") {
          columns = columns.filter((f) => f.name !== groupBy?.property?.name);
        }
        if (props.ignoreColumns) {
          columns = columns.filter((f) => !props.ignoreColumns?.includes(f.name));
        }

        if (props.view === "board") {
          const property = entity.properties.find((f) => f.type === PropertyType.SELECT && !f.isHidden);
          if (property) {
            groupBy = { property };
          }
        }
      } else {
        columns = view.properties
          .sort((a, b) => a.order - b.order)
          .map((f) => {
            return { name: f.name ?? "", title: "", visible: true };
          });
        if (props.ignoreColumns) {
          columns = columns.filter((f) => !props.ignoreColumns?.includes(f.name));
        }

        if (view.layout === "board") {
          columns = columns.filter((f) => f.name !== groupBy?.property?.name);
        }

        if (view.groupByPropertyId) {
          const property = entity.properties.find((f) => f.id === view?.groupByPropertyId);
          if (property) {
            groupBy = { property };
          }
        }
      }
    }

    // if (props.readOnly) {
    //   columns = columns.filter((f) => ![RowDisplayDefaultProperty.FOLIO.toString()].includes(f.name));
    // }

    if (props.columns !== undefined) {
      columns = props.columns;
    }

    setEntity(entity);
    setColumns(columns);
    setGroupBy(groupBy);
  }, [appOrAdminData.entities, props]);

  if (!entity) {
    return null;
  } else if (columns.length === 0) {
    return null;
  }

  return <RowsListWrapped {...props} entity={entity} columns={columns} groupBy={groupBy} />;
}

function RowsListWrapped({
  view,
  entity,
  items,
  routes,
  columns,
  pagination,
  groupBy,
  onEditRow,
  currentView,
  selectedRows,
  onSelected,
  readOnly,
  onClickRoute,
  onRemove,
  actions,
  leftHeaders,
  rightHeaders,
  searchInput,
  entityTitle,
  onNewRow,
  permissionCreate,
}: Props & {
  entity: EntityWithDetails;
  columns: ColumnDto[];
  groupBy?: { property?: PropertyWithDetails };
}) {
  const { t } = useTranslation();
  const params = useParams();
  const appOrAdminData = useAppOrAdminData();

  const [options, setOptions] = useState<KanbanColumn<RowWithDetails>[]>([]);
  useEffect(() => {
    if (groupBy?.property) {
      setOptions(
        groupBy.property.options.map((option) => {
          return {
            name: option.value,
            color: option.color,
            title: (
              // <div className="flex items-center space-x-1">
              <div>
                {option.name ? (
                  <div className="text-[#152C5B] text-base font-semibold">{option.name}</div>
                ) : (
                  <div className="text-[#152C5B] text-base font-semibold">{option.value}</div>
                )}
              </div>
            ),
            value: (item: RowWithDetails) => (
              <RenderCard layout={view} item={item} entity={entity} columns={columns} allEntities={appOrAdminData.entities} routes={routes} actions={actions} />
            ),
            onClickRoute: (i: RowWithDetails) => EntityHelper.getRoutes({ routes, entity, item: i })?.edit ?? "",
            onNewRoute: (columnValue: string) => {
              let newRoute = EntityHelper.getRoutes({ routes, entity })?.new;
              if (newRoute) {
                return newRoute + `?${groupBy?.property?.name}=${columnValue}`;
              }
              return "";
            },
          };
        })
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [groupBy]);

  const slicedColumns = useMemo(() => columns?.length ? [...columns].slice(0, 2) : [], [columns]);

  return (
    <Fragment>
      {view == "table" && (
        <RowsListAndTable
          columns={columns}
          entity={entity}
          items={items}
          pagination={pagination}
          routes={routes}
          onFolioClick={onEditRow}
          onEditClick={onEditRow}
          onRelatedRowClick={onEditRow}
          allEntities={appOrAdminData.entities}
          editable={!readOnly}
          selectedRows={selectedRows}
          onSelected={onSelected}
          onRemove={onRemove}
          leftHeaders={leftHeaders}
          rightHeaders={rightHeaders}
          searchInput={searchInput}
          entityTitle={entityTitle}
          onNewRow={onNewRow}
          permissionCreate={permissionCreate}
        />
      )}
      {view === "board" && groupBy && (
        <KanbanSimple
          items={items}
          classNameWidth={clsx("")}
          filterValue={(item, column) => {
            if (groupBy.property) {
              const value = RowHelper.getPropertyValue({ entity, item, property: groupBy.property });
              if (column === null && !value) {
                return true;
              }
              return value === column?.name;
            }
            return false;
          }}
          columns={options}
          undefinedColumn={{
            name: t("shared.undefined"),
            color: Colors.UNDEFINED,
            title: (
              <div>
                <div className="text-[#152C5B] text-base font-semibold">{t("shared.undefined")}</div>
              </div>
            ),
            value: (item: RowWithDetails) => {
              return (
                <div className="mt-4 rounded-md bg-white">
                  <RenderCard
                    layout={view}
                    item={item}
                    entity={entity}
                    columns={columns}
                    allEntities={appOrAdminData.entities}
                    routes={routes}
                    actions={actions}
                  />
                </div>
              );
            },
            onClickRoute: (i: RowWithDetails) => EntityHelper.getRoutes({ routes, entity, item: i })?.edit ?? "",
          }}
          column={groupBy.property?.name ?? ""}
          // renderEmpty={<EmptyCard className="w-full" />}
        />
      )}
      {/* <SavedJobsCard jobCount={3} /> */}
      {view === "grid" && (
        <Fragment>
          {items.length === 0 ? (
            <EmptyState
              className="w-full py-8"
              // to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
              captions={{
                // new: "Add",
                thereAreNo: "No " + t(entity.titlePlural),
              }}
            />
          ) : (
            <div className="space-y-2">
              {/* {pagination && (
            <GridPagination
              defaultPageSize={currentView?.pageSize ?? undefined}
              totalItems={pagination.totalItems}
              totalPages={pagination.totalPages}
              page={pagination.page}
              pageSize={pagination.pageSize}
            />
          )} */}
              <GridContainer {...(currentView ? EntityViewHelper.getGridLayout(currentView) : { columns: 3, gap: "xs" })}>
                {items.map((item) => {
                  const href = onClickRoute ? onClickRoute(item) : EntityHelper.getRoutes({ routes, entity, item })?.overview ?? undefined;
                  if (onSelected && selectedRows !== undefined) {
                    return (
                      <ButtonSelectWrapper key={item.id} item={item} onSelected={onSelected} selectedRows={selectedRows}>
                        <RenderCard
                          layout={view}
                          item={item}
                          entity={entity}
                          columns={columns}
                          allEntities={appOrAdminData.entities}
                          routes={routes}
                          actions={actions}
                          onRemove={onRemove}
                        />
                      </ButtonSelectWrapper>
                    );
                  }
                  const card = (
                    <div className={clsx("group relative rounded-md bg-white text-left", href && "hover:bg-gray-50")}>
                      <RemoveButton
                        item={item}
                        readOnly={readOnly}
                        onRemove={onRemove}
                        entity={entity}
                        columns={slicedColumns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        layout={view}
                      />
                      <RenderCard
                        layout={view}
                        item={item}
                        entity={entity}
                        columns={columns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        actions={actions}
                        href={href}
                      />
                    </div>
                  );
                  return href ? (
                    <Link key={item.id} to={href}>
                      {card}
                    </Link>
                  ) : (
                    card
                  );
                  // return (
                  //   <Fragment key={item.id}>
                  //     <Link to={item.id}>
                  //       <div className="group w-full truncate rounded-md border border-gray-300 bg-white p-3 text-left shadow-sm hover:bg-gray-50">
                  //         <RenderCard layout={view} item={item} entity={entity} columns={columns} allEntities={appOrAdminData.entities} routes={routes} actions={actions} />
                  //       </div>
                  //     </Link>
                  //   </Fragment>
                  // );
                })}
                {items.length === 0 ? (
                  <Fragment>{readOnly ? <EmptyCard className="w-full" /> : <AddMoreCard entity={entity} routes={routes} />}</Fragment>
                ) : (
                  <Fragment>
                    <RowsLoadMoreCard pagination={pagination} currentView={currentView} />
                  </Fragment>
                )}
              </GridContainer>
            </div>
          )}
        </Fragment>
      )}
      {view === "card" && (
        <Fragment>
          {items.length === 0 ? (
            <EmptyState
              className="w-full py-8"
              // to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
              captions={{
                // new: "Add",
                thereAreNo: "No " + t(entity.titlePlural),
              }}
            />
          ) : (
            // <div className="flex space-x-2 overflow-x-scroll">
            <div className="grid grid-cols-1 gap-3">
              {items.map((item) => {
                let className = clsx("w-full");
                if (onSelected && selectedRows !== undefined) {
                  return (
                    <ButtonSelectWrapper className={clsx("group relative")} key={item.id} item={item} onSelected={onSelected} selectedRows={selectedRows}>
                      <div className={className}>
                        <RemoveButton
                          item={item}
                          readOnly={readOnly}
                          onRemove={onRemove}
                          entity={entity}
                          columns={slicedColumns}
                          allEntities={appOrAdminData.entities}
                          routes={routes}
                          layout={view}
                        />
                        <RenderCard
                          layout={view}
                          item={item}
                          entity={entity}
                          columns={columns}
                          allEntities={appOrAdminData.entities}
                          routes={routes}
                          actions={actions}
                        />
                      </div>
                    </ButtonSelectWrapper>
                  );
                }
                const href = onClickRoute ? onClickRoute(item) : EntityHelper.getRoutes({ routes, entity, item })?.overview ?? undefined;
                const card = (
                  <div className={clsx(className, "group relative rounded-md text-left", href && "hover:bg-gray-50")}>
                    <div className={className}>
                      <RemoveButton
                        item={item}
                        readOnly={readOnly}
                        onRemove={onRemove}
                        entity={entity}
                        columns={slicedColumns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        layout={view}
                      />
                      <RenderCard
                        layout={view}
                        item={item}
                        entity={entity}
                        columns={columns}
                        allEntities={appOrAdminData.entities}
                        routes={routes}
                        actions={actions}
                        href={href}
                      />
                    </div>
                  </div>
                );
                return href ? <>{card}</> : card;
              })}
              {items.length === 0 ? (
                <Fragment>{readOnly ? <EmptyCard className="w-full" /> : <AddMoreCard className="w-64" entity={entity} routes={routes} />}</Fragment>
              ) : (
                <Fragment>
                  {/* {!readOnly && <AddMoreCard className="w-64" entity={entity} routes={routes} />} */}
                  <RowsLoadMoreCard className="w-64" pagination={pagination} currentView={currentView} />
                </Fragment>
              )}
            </div>
          )}
        </Fragment>
      )}
    </Fragment>
  );
}

export function AddMoreCard({
  entity,
  routes,
  className,
  title,
}: {
  entity: EntityWithDetails;
  routes?: EntitiesApi.Routes;
  className?: string;
  title?: string;
}) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className={className}>
        {routes && (
          <Link
            className={clsx(
              // "group flex h-full items-center rounded-md border-2 border-dashed border-slate-200 p-2 text-left align-middle shadow-sm hover:border-dotted hover:border-slate-300 hover:bg-slate-100",
              "relative flex w-64 space-x-1 rounded-md border border-dashed border-gray-300 px-2 py-1 text-center text-xs text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500",
              className
            )}
            to={EntityHelper.getRoutes({ routes, entity })?.new ?? ""}
          >
            {/* <div className="mx-auto flex justify-center text-center align-middle text-sm font-medium text-gray-700">{t("shared.add")}</div> */}
            <div className="flex items-center">
              <div className="">{t("shared.add")}</div>
              {title && <div className="ml-1 lowercase">{title}</div>}
            </div>
          </Link>
        )}
      </div>
    </Fragment>
  );
}

export function EmptyCard({ className }: { className?: string }) {
  const { t } = useTranslation();
  return (
    <Fragment>
      <div className={className}>
        <div className="group inline-block h-full w-full truncate rounded-md border-2 border-dashed border-slate-300 bg-white p-12 text-left align-middle shadow-sm">
          <div className="mx-auto flex justify-center text-center align-middle text-sm font-medium text-gray-700">{t("shared.noRecords")}</div>
        </div>
      </div>
    </Fragment>
  );
}

function ButtonSelectWrapper({
  item,
  onSelected,
  selectedRows,
  children,
  className,
}: {
  item: RowWithDetails;
  selectedRows: RowWithDetails[];
  onSelected: (item: RowWithDetails[]) => void;
  children: React.ReactNode;
  className?: string;
}) {
  const isSelected = selectedRows.find((f) => f.id === item.id);
  return (
    <div className={clsx(className, "group relative rounded-md text-left", isSelected ? "bg-theme-50 hover:bg-theme-50" : "bg-white hover:bg-gray-50")}>
      <button
        type="button"
        className="absolute right-0 top-0 mr-2 mt-2 origin-top-right justify-center"
        onClick={() => {
          if (isSelected) {
            onSelected(selectedRows.filter((f) => f.id !== item.id));
          } else {
            onSelected([...(selectedRows ?? []), item]);
          }
        }}
      >
        {isSelected ? (
          <svg
            fill="currentColor"
            className="h-5 w-5 text-teal-700"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <path d="M 39 4 L 11 4 C 7.140625 4 4 7.140625 4 11 L 4 39 C 4 42.859375 7.140625 46 11 46 L 39 46 C 42.859375 46 46 42.859375 46 39 L 46 11 C 46 7.140625 42.859375 4 39 4 Z M 23.085938 34.445313 L 13.417969 25.433594 L 14.78125 23.96875 L 22.914063 31.554688 L 36.238281 15.832031 L 37.761719 17.125 Z"></path>
          </svg>
        ) : (
          <svg
            fill="currentColor"
            className="h-5 w-5 text-teal-700"
            xmlns="http://www.w3.org/2000/svg"
            x="0px"
            y="0px"
            width="50"
            height="50"
            viewBox="0 0 50 50"
          >
            <path d="M 39 4 L 11 4 C 7.101563 4 4 7.101563 4 11 L 4 39 C 4 42.898438 7.101563 46 11 46 L 39 46 C 42.898438 46 46 42.898438 46 39 L 46 11 C 46 7.101563 42.898438 4 39 4 Z M 42 39 C 42 40.699219 40.699219 42 39 42 L 11 42 C 9.300781 42 8 40.699219 8 39 L 8 11 C 8 9.300781 9.300781 8 11 8 L 39 8 C 40.699219 8 42 9.300781 42 11 Z"></path>
          </svg>
        )}
      </button>
      {children}
    </div>
  );
}

function RemoveButton({
  item,
  readOnly,
  onRemove,
  columns,
  allEntities,
  entity,
  routes,
  layout,
}: {
  item: RowWithDetails;
  layout: "table" | "grid" | "board" | "card";
  readOnly?: boolean;
  onRemove?: (item: RowWithDetails) => void;
  entity: EntityWithDetails;
  columns: ColumnDto[];
  allEntities: EntityWithDetails[];
  routes: EntitiesApi.Routes | undefined;
}) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();
  

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowMenu((prevShowMenu) => !prevShowMenu);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!showMenu) return;
      setShowMenu(false);
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showMenu]);


  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders({ entity, columns, layout, allEntities: allEntities, t, routes }));
  }, [entity, columns, layout, allEntities, t, routes]);

  const title = headers[0]?.value(item,0) ?? "";
  const subtitle = headers[1]?.value(item,1) ?? "";
  const details: string[] = [];

  const heading: string = entity?.name ?? "";

  item?.values.forEach((currItem, index) => {
    const currentValue = currItem.textValue
    if (currentValue && currentValue !== title && currentValue !== subtitle) {
      details.push(currentValue);
    }
  });


  function handleRemoveClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    setShowDeleteModal(true);
  }

  function handleDeleteConfirm() {
    if (onRemove) {
      onRemove(item);
    }
    setShowDeleteModal(false);
  }

  const deleteLabel = `${t("shared.delete")} ${entity?.parentEntities?.[0]?.child?.title || ""}`;

  const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="17" viewBox="0 0 16 17" fill="none">
      <path d="M9.37333 6.14615L9.98667 6.75948L3.94667 12.7995H3.33333V12.1861L9.37333 6.14615ZM11.7733 2.13281C11.6067 2.13281 11.4333 2.19948 11.3067 2.32615L10.0867 3.54615L12.5867 6.04615L13.8067 4.82615C14.0667 4.56615 14.0667 4.14615 13.8067 3.88615L12.2467 2.32615C12.1133 2.19281 11.9467 2.13281 11.7733 2.13281ZM9.37333 4.25948L2 11.6328V14.1328H4.5L11.8733 6.75948L9.37333 4.25948Z" fill="#121212" />
    </svg>
  );

  const editRoute = EntityHelper.getRoutes({ routes, entity, item })?.edit;

  const menuItems = [
    ...(editRoute
      ? [{ label: t("shared.edit"), icon: <EditIcon />, onClick: () => navigate(editRoute), className: "text-[#262626] hover:bg-[#FFEFC9]" }]
      : []),
    { label: deleteLabel, onClick: handleRemoveClick, className: "text-[#FE7070] hover:bg-[#FEF1F0]" },
  ];

  return (
    <Fragment>
      <div className="relative">
        {onRemove && (
          <div>

            <button
              onClick={toggleMenu}
              className={clsx(
                "absolute right-2 top-[12px] mr-2 mt-2 flex flex-col gap-2 justify-center items-center h-6 rounded border border-solid shadow-sm bg-white hover:bg-zinc-100 border-zinc-300 max-md:h-6 max-sm:h-6 cursor-pointer",
              )}
            >
              <span className="flex shrink-0 gap-2 justify-center items-center px-1 py-0 w-6 h-6 max-md:w-6 max-md:h-6 max-sm:w-6 max-sm:h-6">
                <svg width="3" height="11" viewBox="0 0 3 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M1.38542 10.2396C1.06458 10.2396 0.789931 10.1253 0.561458 9.89688C0.332986 9.6684 0.21875 9.39375 0.21875 9.07292C0.21875 8.75208 0.332986 8.47743 0.561458 8.24896C0.789931 8.02049 1.06458 7.90625 1.38542 7.90625C1.70625 7.90625 1.9809 8.02049 2.20938 8.24896C2.43785 8.47743 2.55208 8.75208 2.55208 9.07292C2.55208 9.39375 2.43785 9.6684 2.20938 9.89688C1.9809 10.1253 1.70625 10.2396 1.38542 10.2396ZM1.38542 6.73958C1.06458 6.73958 0.789931 6.62535 0.561458 6.39688C0.332986 6.1684 0.21875 5.89375 0.21875 5.57292C0.21875 5.25208 0.332986 4.97743 0.561458 4.74896C0.789931 4.52049 1.06458 4.40625 1.38542 4.40625C1.70625 4.40625 1.9809 4.52049 2.20938 4.74896C2.43785 4.97743 2.55208 5.25208 2.55208 5.57292C2.55208 5.89375 2.43785 6.1684 2.20938 6.39688C1.9809 6.62535 1.70625 6.73958 1.38542 6.73958ZM1.38542 3.23958C1.06458 3.23958 0.789931 3.12535 0.561458 2.89688C0.332986 2.6684 0.21875 2.39375 0.21875 2.07292C0.21875 1.75208 0.332986 1.47743 0.561458 1.24896C0.789931 1.02049 1.06458 0.90625 1.38542 0.90625C1.70625 0.90625 1.9809 1.02049 2.20938 1.24896C2.43785 1.47743 2.55208 1.75208 2.55208 2.07292C2.55208 2.39375 2.43785 2.6684 2.20938 2.89688C1.9809 3.12535 1.70625 3.23958 1.38542 3.23958Z" fill="#121212" />
                </svg>

              </span>
            </button>
          </div>
        )}

        <div className="absolute right-[50px] top-[-12px] z-50">
          {showMenu && (
            <div>
              <RelationCardMenu menuItems={menuItems} />
            </div>
          )}
        </div>
      </div>




      {showDeleteModal &&
        createPortal(
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            {item && (
              <DeleteConfirmationPopup
                onCancel={() => setShowDeleteModal(false)}
                onDelete={handleDeleteConfirm}
                title={title}
                subtitle={subtitle}
                heading ={heading}
                details={details}
              />
            )}
          </div>,
          document.body
        )}
    </Fragment>
  );
}
