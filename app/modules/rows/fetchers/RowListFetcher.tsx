import { useSearchParams } from "@remix-run/react";
import { ReactNode, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "~/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import InputFilters, { FilterDto } from "~/components/ui/input/InputFilters";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import EntityHelper from "~/utils/helpers/EntityHelper";
import RowNewFetcher from "./RowNewFetcher";
import RowsList from "~/components/entities/rows/RowsList";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import Loading from "~/components/ui/loaders/Loading";
import { useTypedFetcher } from "remix-typedjson";
import { DialogTitle } from "@headlessui/react";
import AddButton from "~/custom/components/button/AddButton";
import { View } from "lucide-react";
import ViewButton from "~/custom/components/button/ViewButton";
import TableSearch from "~/custom/components/tables/TableSearch";

interface Props {
  currentView: EntityViewWithDetails | null;
  listUrl: string;
  newUrl: string;
  parentEntity?: EntityWithDetails;
  onSelected: (rows: RowWithDetails[]) => void;
  multipleSelection?: boolean;
  allEntities: EntityWithDetails[];
  distinct: boolean;
  titleop?: string | ReactNode;
}

export default function RowListFetcher({ titleop, currentView, listUrl, newUrl, parentEntity, onSelected, multipleSelection, allEntities, distinct = false }: Props) {
  const { t } = useTranslation();
  const fetcher = useTypedFetcher<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [data, setData] = useState<{ rowsData: RowsApi.GetRowsData; routes: EntitiesApi.Routes }>();
  const [adding, setAdding] = useState(false);
  const [rows, setRows] = useState<RowWithDetails[]>([]);
  const [selectedRows, setSelectedRows] = useState<RowWithDetails[]>([]);
  const [searchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState<string>("");


  useEffect(() => {
    fetcher.load(listUrl);
    setAdding(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listUrl, distinct]);

  useEffect(() => {
    if (currentView) {
      searchParams.set("v", currentView.name);
    }
    fetcher.load(listUrl + "?" + searchParams.toString());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentView]);

  useEffect(() => {
    if (fetcher.data) {
      const data: { rowsData: RowsApi.GetRowsData } = fetcher.data;
      setData(fetcher.data);
      setRows(data.rowsData.items);
    }
  }, [fetcher.data]);

  function onRowsSelected(rows: RowWithDetails[]) {
    setSelectedRows(rows);
  }

  function onCreated(row: RowWithDetails) {
    setRows([row, ...rows]);
    setSelectedRows([row, ...selectedRows]);
    setAdding(false);
  }

  function onConfirm(rows: RowWithDetails[]) {
    onSelected(rows);
  }

  function filteredItems() {
    if (!searchInput) return rows;
    return rows.filter((row) => row?.values?.some((value) => value?.textValue?.toLowerCase().includes(searchInput.toLowerCase().trim())));
  }
  

  function onclose() {
    setAdding(false);
  }
  if (distinct) {
    return (
      <>
        <RowNewFetcher
          url={newUrl}
          parentEntity={parentEntity}
          onCreated={(newRow) => {
            onSelected([newRow]);
          }}
          allEntities={allEntities}
        />
        </>
    );
  }

  return (
    <div>
      {!fetcher.data ? (
        <Loading small loading />
      ) : !data?.rowsData?.entity ? (
        <div className="relative block w-full cursor-not-allowed rounded-lg border-2 border-dashed border-gray-300 p-4 text-center">
          {t("shared.loading")}...
        </div>
      ) : !data?.rowsData ? (
        <div>No data</div>
      ) : data?.rowsData ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between space-x-2 mb-[24px]">
            <div className="text-lg font-bold text-gray-800">{t(data.rowsData?.entity.titlePlural)}</div>

            <div className="flex space-x-2">
              <AddButton
                onClick={() => setAdding(true)}
                label={
                  <span className="sm:text-sm flex items-center">
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                      <path d="M7.66683 3.66732H6.3335V6.33398H3.66683V7.66732H6.3335V10.334H7.66683V7.66732H10.3335V6.33398H7.66683V3.66732ZM7.00016 0.333984C3.32016 0.333984 0.333496 3.32065 0.333496 7.00065C0.333496 10.6807 3.32016 13.6673 7.00016 13.6673C10.6802 13.6673 13.6668 10.6807 13.6668 7.00065C13.6668 3.32065 10.6802 0.333984 7.00016 0.333984ZM7.00016 12.334C4.06016 12.334 1.66683 9.94065 1.66683 7.00065C1.66683 4.06065 4.06016 1.66732 7.00016 1.66732C9.94016 1.66732 12.3335 4.06065 12.3335 7.00065C12.3335 9.94065 9.94016 12.334 7.00016 12.334Z" fill="white" />
                    </svg>
                    {`Create ${data.rowsData?.entity?.title}`}
                  </span>
                }
                className="custom-class-for-add-button md:text-base"
              />
            </div>
          </div>

          <div className="mt-[44px] max-w-7xl mx-auto">
            <div className="border border-gray-300 rounded-lg shadow-md bg-white">
              {/* Search bar and filters */}
              <div className="flex flex-shrink-0 flex-grow-0 items-center justify-between self-stretch px-3 max-sm:gap-3 pt-3">
                <div className="max-w-[400px] w-full md:w-1/2 lg:w-1/3">
                  <TableSearch
                    value={searchInput}
                    setValue={setSearchInput}
                    placeholder={`Search ${data.rowsData.entity.title}`}
                  />
                </div>

                <div className="flex flex-row gap-3 mr-3 max-sm:mr-0 ml-2 md:justify-start">
                  <InputFilters filters={EntityHelper.getFilters({ t, entity: data.rowsData.entity })} />
                  {selectedRows.length > 0 && (
                    <button
                      type="button"
                      onClick={() => onConfirm(selectedRows)}
                      className="ml-auto flex flex-col justify-center items-center px-3 py-1 !text-sm leading-loose text-[#FF7800] font-normal rounded-md bg-[#FFF0E5] border-1 cursor-pointer rounded-[6px] disabled:cursor-not-allowed"
                      disabled={selectedRows.length === 0 || (selectedRows.length > 1 && !multipleSelection)}
                    >
                      {selectedRows.length === 1 ? (
                        <div className="flex space-x-1">
                          <div>{t("shared.select")} 1</div>
                          <div className="lowercase">{t(data.rowsData?.entity.name)}</div>
                        </div>
                      ) : (
                        <div className="flex space-x-1">
                          <div>
                            {t("shared.select")} {selectedRows.length}
                          </div>
                          <div className="lowercase">{t(data.rowsData?.entity.titlePlural)}</div>
                        </div>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Rows List/Table */}
              <div className="mt-4">
                <RowsList
                  view={(currentView?.layout ?? "table") as "table" | "board" | "grid" | "card"}
                  currentView={currentView}
                  entity={data.rowsData.entity}
                  items={filteredItems()}
                  pagination={data.rowsData.pagination}
                  selectedRows={selectedRows}
                  onSelected={onRowsSelected}
                  readOnly={true}
                  ignoreColumns={[RowDisplayDefaultProperty.FOLIO]}
                  searchInput={searchInput}  // Pass search input to RowsList
                  filters={EntityHelper.getFilters({ t, entity: data.rowsData.entity })}  // Pass filters to RowsList
                />
              </div>
            </div>
          </div>

        </div>
      ) : (
        <div>{t("shared.unknownError")}</div>
      )}
      <SlideOverWideEmpty
        title={
          <span className="text-lg leading-[21.78px] tracking-normal font-semibold">
          {data?.rowsData?.entity.title}
          </span>
        }
        // className="max-w-md"
        open={adding}
        onClose={() => setAdding(false)}
        size="5xl"
      >
        <RowNewFetcher url={newUrl} parentEntity={parentEntity} onCreated={onCreated} allEntities={allEntities} />
      </SlideOverWideEmpty>
    </div>
  );
}
