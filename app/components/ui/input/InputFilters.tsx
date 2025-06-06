import { Transition } from "@headlessui/react";
import clsx from "clsx";
import { FormEvent, Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Form, useSearchParams } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
import FilterEmptyIcon from "../icons/FilterEmptyIcon";
import FilterFilledIcon from "../icons/FilterFilledIcon";
import InputCheckboxInline from "./InputCheckboxInline";
import InputSelect from "./InputSelect";
import { Input } from "../input";
import { Button } from "../button";

export type FilterDto = {
  name: string;
  title: string;
  options?: { name: string; value: string; color?: Colors }[];
  hideSearch?: boolean;
  isBoolean?: boolean;
};

export type FilterValueDto = FilterDto & {
  selected: boolean;
  value?: string;
};

interface Props {
  filters: FilterDto[];
  withSearch?: boolean;
  withName?: boolean;
  formClass?: string
}

export default function InputFilters({ filters, withSearch = true, formClass }: Props) {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [opened, setOpened] = useState(false);
  const [items, setItems] = useState<FilterValueDto[]>([]);
  const [filteredItems, setFilteredItems] = useState<number>(0);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    const items: FilterValueDto[] = filters.map((item) => {
      const value = searchParams.get(item.name) ?? undefined;
      return {
        ...item,
        selected: value !== undefined,
        value,
      };
    });
    setItems(items);
    setSearchInput(searchParams.get("q") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const appliedFilters: FilterValueDto[] = [];
    items.forEach((item) => {
      const value = searchParams.get(item.name) ?? undefined;
      if (value) {
        appliedFilters.push(item);
      }
    });
    if (withSearch) {
      setFilteredItems(appliedFilters.length + (searchParams.get("q") ? 1 : 0));
    } else {
      setFilteredItems(appliedFilters.length);
    }
  }, [items, searchInput, searchParams, withSearch]);

  function onClear() {
    setOpened(false);

    items.forEach((item) => {
      searchParams.delete(item.name);
      item.selected = false;
      item.value = undefined;
    });
    setItems(items);

    searchParams.delete("page");
    searchParams.delete("q");
    setSearchInput("");

    setSearchParams(searchParams);
  }

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    items.forEach((item) => {
      if (item.selected && item.value?.trim()) {
        searchParams.set(item.name, item.value?.toString().trim() ?? "");
      } else {
        searchParams.delete(item.name);
      }
    });

    if (searchInput) {
      searchParams.set("q", searchInput);
    } else {
      searchParams.delete("q");
    }

    searchParams.delete("page");
    setSearchParams(searchParams);
    setOpened(false);
  }

  // const clickOutside = useOuterClick(() => setOpened(false));

  return (
    <Fragment>
      <div className="relative">
        <button
          onClick={() => setOpened(!opened)}
          className="focus:border-bg-gray-50 relative z-0 inline-flex !rounded-md text-sm shadow-sm hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-0 "
        >
          <span
            className={clsx(
              "border-border bg-background-subtle relative inline-flex items-center space-x-2 border px-3 py-3 text-sm font-normal text-[rgba(0,0,0,0.88)] hover:bg-[#F2F2F2] sm:py-2",
              filteredItems === 0 ? "rounded-[6px]" : "rounded-md bg-[#F2F2F2]",
              opened ? "bg-[#F2F2F2]" : ""
            )}
          >
            <div>
              {filteredItems === 0 && <FilterEmptyIcon className="h-3 w-3" />}
              {filteredItems > 0 && <FilterFilledIcon className="h-3 w-3" />}
            </div>
            <div className=" text-left text-sm font-normal text-[rgba(0,0,0,0.88)] sm:block">{t("shared.filters")}</div>
            {filteredItems > 0 && (
              <span
                className={clsx(
                  "relative  inline-flex items-center rounded-md border border-gray-300 px-1.5 py-[1px] sm:text-xs",
                  filteredItems > 0 ? "bg-[#190C00] text-[#FFFFFF]" : "bg-white text-gray-700"
                )}
              >
                {filteredItems}
              </span>
            )}
          </span>
        </button>

        <Transition
          as={Fragment}
          show={opened}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Form
            onSubmit={onSubmit}
            method="get"
            className={clsx("absolute right-0 z-40 mt-2 h-fit max-h-60 w-64 origin-top-right divide-y divide-gray-200 overflow-visible overflow-y-auto rounded-md bg-white shadow-2xl ring-1 ring-black ring-opacity-5 focus:outline-none",
              formClass )}>
            <div className="flex items-center justify-between px-2 py-2 text-sm">
              <Button type="button" variant="outline" onClick={onClear}>
                {t("shared.clear")}
              </Button>
              <div className="font-bold">{t("shared.filters")}</div>
              <Button type="submit" variant="outline">
                {t("shared.apply")}
              </Button>
            </div>
            <div className="divide-y divide-gray-200 rounded-b-md bg-white text-sm">
              {items.map((filter) => {
                const idx = items.findIndex((item) => item.name === filter.name);
                return (
                  <div key={filter.name} className="divide-y divide-gray-200">
                    <div className="divide-y divide-gray-300 px-2 py-2">
                      <InputCheckboxInline
                        name={"filter-" + filter.name}
                        title={filter.title.includes(".") ? t(filter.title) : filter.title}
                        value={filter.selected}
                        setValue={(e) => {
                          updateItemByIdx(items, setItems, idx, {
                            selected: Boolean(e),
                          });
                        }}
                      />
                    </div>
                    {filter.selected && (
                      <div className="bg-gray-50 px-2 py-1">
                        {filter.options && filter.options.length > 0 ? (
                          <div className="flex items-center space-x-2">
                            <InputSelect
                              // dropdownRef={selectRef}
                              // withSearch={!filter.hideSearch}
                              name={filter.name}
                              title={""}
                              // withColors={true}
                              placeholder={t("shared.select") + "..."}
                              options={filter.options.map((item) => {
                                return {
                                  value: item.value,
                                  name: item.name && item.name.includes(".") ? t(item.name) : item.name,
                                  color: item.color,
                                };
                              })}
                              value={filter.value}
                              withLabel={false}
                              setValue={(e) => {
                                updateItemByIdx(items, setItems, idx, {
                                  value: e,
                                });
                              }}
                              className="bg-background w-full pb-1"
                            />
                          </div>
                        ) : filter.isBoolean ? (
                          <div className="flex items-center space-x-2">
                            <InputSelect
                              name={filter.name}
                              title={""}
                              placeholder={t("shared.select") + "..."}
                              options={[
                                { name: t("shared.yes"), value: "true" },
                                { name: t("shared.no"), value: "false" },
                              ]}
                              value={filter.value}
                              withLabel={false}
                              setValue={(e) => {
                                updateItemByIdx(items, setItems, idx, {
                                  value: e,
                                });
                              }}
                              className="bg-background w-full pb-1"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <div className="flex-shrink-0 truncate text-gray-500">contains</div>
                            <Input
                              type="text"
                              name={filter.name}
                              autoComplete="off"
                              className="focus:border-accent-500 focus:ring-accent-500 bg-background block w-full min-w-0 flex-1 rounded-md border-gray-300 p-1 text-sm"
                              required
                              value={filter.value ?? ""}
                              onChange={(e) => {
                                updateItemByIdx(items, setItems, idx, {
                                  value: e.currentTarget.value,
                                });
                              }}
                            />
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Form>
        </Transition>
      </div>
    </Fragment>
  );
}
