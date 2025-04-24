import { Fragment, ReactNode, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useLocation, useNavigation, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import RowsList from "~/components/entities/rows/RowsList";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import InputFilters, { FilterDto } from "~/components/ui/input/InputFilters";
import TabsWithIcons from "~/components/ui/tabs/TabsWithIcons";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { useAppData } from "~/utils/data/useAppData";
import EntityViewForm from "~/components/entities/views/EntityViewForm";
import { UserSimple } from "~/utils/db/users.db.server";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { useTypedActionData } from "remix-typedjson";
import { Rows_List } from "../routes/Rows_List.server";
import { toast } from "sonner";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import RunPromptFlowButtons from "~/modules/promptBuilder/components/run/RunPromptFlowButtons";
import ConfirmModal, { RefConfirmModal } from "~/components/ui/modals/ConfirmModal";
import TrashIcon from "~/components/ui/icons/TrashIcon";
import clsx from "clsx";
import TableSearch from "~/custom/components/tables/TableSearch";
import { ViewButton } from "~/custom/components/button/ViewButton";
import AddButton from "~/custom/components/button/AddButton";
import DownloadCSVButton from "~/custom/components/button/DownloadCSVButton";
import BreadcrumbCustom from "~/custom/components/breadcrumbs/Breadcrumb";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import MasterGraphComponent from "~/custom/modules/graphs/components/masterGraphComponent";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import InputSelect from "~/components/ui/input/InputSelect";

interface Props {
  data?: any
  title?: ReactNode;
  rowsData: RowsApi.GetRowsData;
  items: RowWithDetails[];
  routes?: EntitiesApi.Routes;
  onNewRow?: () => void;
  onEditRow?: (item: RowWithDetails) => void;
  saveCustomViews?: boolean;
  permissions: {
    create: boolean;
  };
  currentSession: {
    user: UserSimple;
    isSuperAdmin: boolean;
  } | null;
}
export default function RowsViewRoute({ title, rowsData, items, routes, onNewRow, onEditRow, saveCustomViews, permissions, currentSession, data }: Props) {
  const { t } = useTranslation();
  const actionData = useTypedActionData<Rows_List.ActionData>();
  const appData = useAppData();
  const submit = useSubmit();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();

  const confirmDeleteRows = useRef<RefConfirmModal>(null);

  const [bulkActions, setBulkActions] = useState<string[]>([]);

  const [view, setView] = useState(rowsData.currentView?.layout ?? searchParams.get("view") ?? "table");
  const [filters, setFilters] = useState<FilterDto[]>([]);

  const [showCustomViewModal, setShowCustomViewModal] = useState(false);
  const [editingView, setEditingView] = useState<EntityViewWithDetails | null>(null);

  const [selectedRows, setSelectedRows] = useState<RowWithDetails[]>([]);
  const [searchInput, setSearchInput] = useState<string>("");

  const [tableFilterOptions, setTableFilterOptions] = useState<any[]>([]);
  const [selectedTableFilters, setSelectedTableFilters] = useState<any>();
  const params: any = useParams();
  const appOrAdminData = useAppOrAdminData();
  const group = appOrAdminData.entityGroups.find((f) => f.slug === params.group);
  const menuItems = [
    {
      title: params.group?.charAt(0).toUpperCase() + params.group?.slice(1),
      routePath: `/app/${params.tenant}/g/${params.group}`,
      icon: rowsData?.entity?.icon ? (
        <EntityIcon className="h-4 w-4" icon={group?.icon} />
      ) : rowsData?.entity?.icon === null || rowsData?.entity?.icon === undefined ? (
        <EntityIcon className="h-4 w-4" icon={undefined} />
      ) : (
        <svg stroke="currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">
          {" "}
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />{" "}
        </svg>
      ),
    },
    {
      title: params.entity?.charAt(0).toUpperCase() + params.entity?.slice(1),
      routePath: `/app/${params.tenant}/g/${params.group}/e/${params.entity}`,
    },
  ];

  useEffect(() => {
    setFilters(EntityHelper.getFilters({ t, entity: rowsData.entity, pagination: rowsData.pagination }));
    const bulkActions: string[] = [];
    if (rowsData.entity.hasBulkDelete) {
      bulkActions.push("bulk-delete");
    }
    setBulkActions(bulkActions);
  }, [rowsData, t]);

  useEffect(() => {
    const newView = rowsData.currentView?.layout ?? searchParams.get("view") ?? "table";
    setView(newView);
  }, [searchParams, rowsData.entity, rowsData.currentView?.layout]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
      setSelectedRows([]);
    } else if (actionData?.rowsDeleted) {
      setSelectedRows((rows) => rows.filter((row) => !actionData?.rowsDeleted?.includes(row.id)));
    }
    if (actionData?.updatedView) {
      setShowCustomViewModal(false);
      setEditingView(null);
    }
  }, [actionData]);

  useEffect(() => {
    setShowCustomViewModal(false);
    setEditingView(null);
  }, [searchParams]);

  function filteredItems() {
    const isSearchable = rowsData.entity.properties.filter((item) => item.isSearchable).map((item) => item.id)
    if (!searchInput) return items;
    return items.filter((item) =>
      item?.values?.some((value) => {
        const id = value?.propertyId;
        const type = rowsData.entity.properties.filter((item) => item.id === id).map((item) => item.type)
        if (!isSearchable.includes(id)) return false;
        const input = searchInput.toLowerCase().trim();
        switch (type[0]) {
          case 0:
            return String(value?.numberValue ?? "")
              .toLowerCase()
              .includes(input);
          case 1:
            return value?.textValue?.toLowerCase().includes(input);
          case 2:
            return String(value?.dateValue ?? "")
              .toLowerCase()
              .includes(input);
          case 10:
            return String(value?.booleanValue ?? "")
              .toLowerCase()
              .includes(input);
          default:
            return false;
        }
      })
    );
  }

  function onCreateView() {
    setShowCustomViewModal(true);
    setEditingView(null);
  }

  function onUpdateView() {
    setShowCustomViewModal(true);
    setEditingView(rowsData.currentView);
  }

  function isCurrenView(view: EntityViewWithDetails) {
    return rowsData.currentView?.id === view.id;
  }

  function canUpdateCurrentView() {
    if (currentSession?.isSuperAdmin) {
      return true;
    }
    if (!rowsData.currentView) {
      return false;
    }
    if (rowsData.currentView.userId === currentSession?.user.id) {
      return true;
    }
    if (appData?.currentTenant?.id && rowsData.currentView.tenantId === appData?.currentTenant.id && appData?.isSuperUser) {
      return true;
    }
    return false;
  }

  function capitalize(str: string) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  useEffect(() => {
    let tableFilters = rowsData.entity.properties
      .filter((item) => item.isTableFilter)
      .map((item) => ({ name: item.name, options: item.options.map((option) => ({ value: `${option.value}`, name: ` ${option.value}` })) })).slice(0, 2);
    tableFilters.map((item) => {
      item.options = [{ value: "", name: t("shared.all") }, ...item.options];
      return item;
    });
    setTableFilterOptions(tableFilters);
  }, [])

  const handleTableFilter = (e: any, name: string) => {
    const updatedFilters = { ...selectedTableFilters };

    if (e === "fallback_value") {
      delete updatedFilters[name];
    } else {
      updatedFilters[name] = e;
    }
    setSelectedTableFilters(updatedFilters);
    const searchParams = new URLSearchParams(updatedFilters).toString();
    setSearchParams(searchParams);
  };


  function onDeleteSelectedRows() {
    confirmDeleteRows.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteSelectedRowsConfirmed() {
    const form = new FormData();
    form.set("action", "bulk-delete");
    selectedRows.forEach((item) => {
      form.append("rowIds[]", item.id);
    });
    submit(form, {
      method: "post",
    });
  }

  return (
    <div className="mx-auto max-w-[1920px] gap-5 px-4 py-5 sm:px-6">
     
      <div className="flex flex-col gap-[14px]">
        <div className="flex flex-row items-center justify-between gap-5 max-[769px]:flex-col max-[769px]:items-start">
          <div className="flex flex-col gap-4">
            <div className="pt-3">
              <BreadcrumbCustom
                menu={menuItems}
                // home={`/app/${params?.tenant}/dashboard`}
                className="custom-breadcrumb-style"
              />
            </div>
            <div>
              {title ?? (
                <h3 className="text-secondary-foreground flex flex-1 items-center truncate text-lg font-normal">{`List of ${t(
                  rowsData.entity.titlePlural
                )}`}</h3>
              )}
            </div>
          </div>
          <div className="flex flex-row gap-3 max-[769px]:flex-col">
            <div className="">
              {saveCustomViews && rowsData.entity.hasViews && (
                <Fragment>
                  {canUpdateCurrentView() ? (
                    <div className="flex flex-row gap-3">
                      <ViewButton
                        className="text-sm font-normal text-[#000000] text-opacity-80"
                        onClick={onCreateView}
                        label={t("models.view.actions.create")}
                      />
                      <ViewButton
                        className="text-button-secondary-text-text text-sm font-normal hover:bg-[#F2F2F2]"
                        disabled={!canUpdateCurrentView()}
                        onClick={onUpdateView}
                        label={t("models.view.actions.update")}
                      />

                    </div>
                  ) : (
                    <ViewButton
                      className="text-button-secondary-text-text text-sm font-normal"
                      onClick={onCreateView}
                      label={t("models.view.actions.create")}
                    />
                  )}
                </Fragment>
              )}
            </div>
            <div>
              {permissions.create && (
                <AddButton
                  label={<span className="sm:text-sm">{`+ Add New ${rowsData.entity?.title}`}</span>}
                  className="custom-class-for-add-button bg-brown-500"
                  onClick={onNewRow}
                  disabled={!permissions.create}
                  to={!onNewRow ? "new" : undefined}
                />
              )}
            </div>
          </div>
        </div>
    
        {data?.chartConfig?.chartConfig && <MasterGraphComponent chartConfig={data?.chartConfig?.chartConfig} />}

        {/* <div className="border  rounded-[5px]  shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12)]"> */}
        <div className="w-full rounded-[6px] bg-white shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12)]">
          <div className="flex flex-col gap-4">
            <div className={`flex w-full items-center justify-between px-3 max-md:px-0 ${rowsData.views.length > 1 ? "space-x-2 border-b md:pt-0" : ""}`}>
              {selectedRows.length > 0 ? (
                <div className="flex space-x-1">{bulkActions.includes("bulk-delete") && <DeleteIconButton onClick={onDeleteSelectedRows} />}</div>
              ) : (
                <Fragment>
                  {rowsData.views.length > 1 ? (
                    <TabsWithIcons
                      className="flex-grow xl:flex"
                      tabs={rowsData.views.map((item) => {
                        // if (views.find((f) => f.name === item.name && f.isDefault)) {
                        //   searchParams.delete("v");
                        // } else {
                        searchParams.set("v", item.name);
                        // }
                        searchParams.delete("page");
                        return {
                          name: t(item.title),
                          href: location.pathname + "?" + searchParams.toString(),
                          current: isCurrenView(item),
                        };
                      })}
                    />
                  ) : (
                    <></>
                  )}
                </Fragment>
              )}
            </div>
            <div className="flex flex-shrink-0 flex-grow-0 items-center justify-between self-stretch px-3 max-sm:gap-3">
              <div className="w-full max-w-[342px]">
                <TableSearch value={searchInput} setValue={setSearchInput} placeholder={`Search ${rowsData.entity.title}`} />
              </div>



              <div className="-mr-3 flex flex-row gap-3 max-sm:mr-0">
                <div className="flex gap-[10px]">
                  {
                    tableFilterOptions.map((item) => {
                      return (
                        <div key={item.name} className="w-44">
                          <InputSelect
                           name="tableFilter-1"
                           prefixLabel={capitalize(item.name)}
                          //  title={capitalize(item.name)}
                           value={selectedTableFilters?.[item.name] || ''}
                           setValue={(e) => { handleTableFilter(e, item.name) }}
                           options={item.options}
                           disabled={false}
                          />
                        </div>
                      );
                    })
                  }
                </div>
                <DownloadCSVButton rowsData={rowsData} routes={routes} searchParams={searchParams.toString()} />
                {filters.length > 0 && <InputFilters filters={filters} />}
                <RunPromptFlowButtons type="list" promptFlows={rowsData.promptFlows} className="p-0.5" />
              </div>
            </div>

            <div>
              <RowsList
                view={view as "table" | "board" | "grid" | "card"}
                entity={rowsData.entity}
                items={filteredItems()}
                routes={routes}
                pagination={rowsData.pagination}
                onEditRow={onEditRow}
                currentView={rowsData.currentView}
                selectedRows={selectedRows}
                onSelected={!bulkActions.length ? undefined : (rows) => setSelectedRows(rows)}
                searchInput={searchInput}
                entityTitle={rowsData.entity?.title}
                onNewRow={onNewRow}
                permissionCreate={permissions.create}
              />
              <div className="mt-2 flex items-center justify-between space-x-2">
                <div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Outlet />

      <ConfirmModal ref={confirmDeleteRows} onYes={onDeleteSelectedRowsConfirmed} />

      <div className="z-50">
        <SlideOverWideEmpty
          title={editingView ? "Edit view" : `New ${t(rowsData.entity.title)} view`}
          className="sm:max-w-2xl"
          open={showCustomViewModal}
          onClose={() => setShowCustomViewModal(false)}
          childClassName="mb-16"
        >
          {showCustomViewModal && (
            <EntityViewForm
              isDrawer={true}
              entity={rowsData.entity}
              tenantId={appData.currentTenant?.id ?? null}
              userId={currentSession?.user.id ?? null}
              item={editingView}
              canDelete={true}
              onClose={() => setShowCustomViewModal(false)}
              actionNames={{
                create: "view-create",
                update: "view-edit",
                delete: "view-delete",
              }}
              isSystem={false}
              showViewType={currentSession?.isSuperAdmin ?? false}
            />
          )}
        </SlideOverWideEmpty>
      </div>
    </div>
  );
}

function DeleteIconButton({ onClick }: { onClick: () => void }) {
  const navigation = useNavigation();
  return (
    <button
      type="button"
      className={clsx(
        "group flex items-center rounded-md border border-transparent px-4 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        navigation.state === "submitting" && navigation.formData?.get("action") === "bulk-delete" && "base-spinner"
      )}
      disabled={navigation.state !== "idle"}
      onClick={onClick}
    >
      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-gray-500" />
    </button>
  );
}
