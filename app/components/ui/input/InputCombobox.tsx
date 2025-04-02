import { Ref, forwardRef, useImperativeHandle, useRef, ReactNode, Fragment, useEffect, useState } from "react";
import { Combobox, ComboboxButton, ComboboxOption, ComboboxOptions, Label, Transition } from "@headlessui/react";
import { useTranslation } from "react-i18next";
import { Link } from "@remix-run/react";
import { Colors } from "~/application/enums/shared/Colors";
import ColorBadge from "../badges/ColorBadge";
import HintTooltip from "../tooltips/HintTooltip";
import EntityIcon from "~/components/layouts/icons/EntityIcon";
import clsx from "clsx";
import { Input } from "../input";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

export interface RefInputCombobox {
  focus: () => void;
}

interface Props {
  name?: string;
  title?: string;
  value?: (string | number)[];
  disabled?: boolean;
  options: { value: string | number | undefined; name?: string | ReactNode; color?: Colors; disabled?: boolean }[];
  onChange?: (value: (string | number)[]) => void;
  className?: string;
  withSearch?: boolean;
  withLabel?: boolean;
  withColors?: boolean;
  selectPlaceholder?: string;
  onNew?: () => void;
  onNewRoute?: string;
  required?: boolean;
  help?: string;
  hint?: ReactNode;
  icon?: string;
  borderless?: boolean;
  darkMode?: boolean;
  autoFocus?: boolean;
  readOnly?: boolean;
  renderHiddenInputValue?: (item: string | number) => string;
  prefix?: string;
  onClear?: () => void;
  minDisplayCount?: number;
}
const InputCombobox = (
  {
    name,
    title,
    value,
    options,
    disabled,
    onChange,
    className,
    withSearch = true,
    withLabel = true,
    withColors = false,
    selectPlaceholder,
    onNew,
    required,
    onNewRoute,
    help,
    hint,
    icon,
    borderless,
    darkMode,
    autoFocus,
    readOnly,
    renderHiddenInputValue,
    prefix,
    onClear,
    minDisplayCount = 3,
  }: Props,
  ref: Ref<RefInputCombobox>
) => {
  const { t } = useTranslation();

  const button = useRef<HTMLButtonElement>(null);
  const inputSearch = useRef<HTMLInputElement>(null);

  const [selected, setSelected] = useState<(string | number)[]>(value || []);
  const [searchInput, setSearchInput] = useState("");

  useEffect(() => {
    if (value && !isEqual(selected.sort(), value?.sort())) {
      setSelected(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => {
    if (onChange && !isEqual(selected.sort(), value?.sort())) {
      onChange(selected);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  function isEqual(a: any, b: any) {
    return JSON.stringify(a) === JSON.stringify(b);
  }

  useImperativeHandle(ref, () => ({ focus }));
  function focus() {
    setTimeout(() => {
      button.current?.focus();
      button.current?.click();
    }, 1);
  }

  const filteredItems = () => {
    if (!options) {
      return [];
    }
    return options.filter(
      (f) => f.name?.toString().toUpperCase().includes(searchInput.toUpperCase()) || f.value?.toString().toUpperCase().includes(searchInput.toUpperCase())
    );
  };

  function getSelectedOptions() {
    return options.filter((f) => selected.includes(f.value as string | number));
  }

  return (
    // @ts-ignore
    <Combobox multiple value={selected} onChange={setSelected} disabled={disabled || readOnly} className="flex flex-col gap-[2px]">
      
      {({ open }) => (
        <div>
          {/* {renderHiddenInputValue && <>
            {selected?.map((item, idx) => {
            return <input key={idx} type="hidden" name={name + `[]`} value={JSON.stringify(item)} />;
          })}
          </>} */}

          {withLabel && title && (
            <Label htmlFor={name} className="mb-1 flex justify-between space-x-2 text-xs font-medium">
              <div className=" flex items-center space-x-1">
                <div className="truncate text-body font-normal text-label">
                  {title}
                  {required && <span className="ml-1 text-red-500">*</span>}
                </div>

                {help && <HintTooltip text={help} />}
              </div>
              {hint}
              {onClear && selected.length > 0 ? (
                <button type="button" onClick={onClear} className="text-xs text-gray-500 hover:text-gray-700 focus:outline-none">
                  {t("shared.clear")}
                </button>
              ) : null}
            </Label>
          )}

          <div className="relative">
            <ComboboxButton
              autoFocus={autoFocus}
              type="button"
              ref={button}
              // className={clsx(
              //   "focus:border-accent-500 focus:ring-accent-500 relative w-full cursor-default rounded-md border border-gray-300 py-2 pl-3 pr-10 text-left shadow-sm focus:outline-none focus:ring-1 sm:text-sm",
              //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "bg-white hover:bg-gray-50 focus:bg-gray-50",
              //   borderless && "border-transparent",
              //   darkMode && "dark:border-gray-800 dark:bg-gray-800"
              // )}
              className={clsx(
                className,
                "border-input ring-offset-background placeholder:text-muted-foreground focus:ring-ring flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border bg-transparent px-3 py-2 text-left text-sm shadow-sm focus:outline-none focus:ring-1 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
              )}
            >
              {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <EntityIcon className="h-5 w-5" icon={icon} />
                </div>
              )}

              <div className="inline-flex w-full items-center space-x-2 truncate">
                {/* {withColors && selected && <ColorBadge color={selected?.color ?? Colors.UNDEFINED} />} */}
                <div className="truncate">
                  {/* {JSON.stringify(selected)} */}
                  {selected.length > 0 ? (
                    <span className="truncate">
                      {prefix ?? ""}
                      {getSelectedOptions().length < minDisplayCount
                        ? getSelectedOptions()
                          .map((f) => f.name ?? f.value)
                          .join(", ")
                        : getSelectedOptions().length + " selected"}
                    </span>
                  ) : (
                    <span className="text-muted-foreground text-sm">{selectPlaceholder ?? t("shared.select")}...</span>
                  )}
                </div>
              </div>
              {/* <CaretSortIcon className="h-4 w-4 opacity-50" /> */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clip-path="url(#clip0_418_2328)">
                  <path d="M15.88 9.29L12 13.17L8.11998 9.29C7.72998 8.9 7.09998 8.9 6.70998 9.29C6.31998 9.68 6.31998 10.31 6.70998 10.7L11.3 15.29C11.69 15.68 12.32 15.68 12.71 15.29L17.3 10.7C17.69 10.31 17.69 9.68 17.3 9.29C16.91 8.91 16.27 8.9 15.88 9.29Z" fill="#151B21" />
                </g>
                <defs>
                  <clipPath id="clip0_418_2328">
                    <rect width="24" height="24" fill="white" />
                  </clipPath>
                </defs>
              </svg>

            </ComboboxButton>

            <Transition show={open} as={Fragment} leave="transition ease-in duration-100" leaveFrom="opacity-100" leaveTo="opacity-0">
              <ComboboxOptions
                // onFocus={() => inputSearch.current?.focus()}
                // onBlur={() => setSearchInput("")}
                className={clsx(
                  "bg-background  text-foreground border-border absolute z-10 mt-1 max-h-72 w-full overflow-auto rounded-md border py-1 text-base shadow-lg focus:outline-none sm:text-sm"
                )}
              >
                {(withSearch || onNew || onNewRoute) && (
                  <div className="flex rounded-md p-2 ">
                    <div className="relative flex flex-grow items-stretch focus-within:z-10">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <Input
                        ref={inputSearch}
                        id="search"
                        autoComplete="off"
                        placeholder={t("shared.searchDot")}
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    {onNew && (
                      <button
                        title={t("shared.new")}
                        type="button"
                        onClick={onNew}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md px-2 py-2 text-sm font-medium focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </button>
                    )}

                    {onNewRoute && (
                      <Link
                        to={onNewRoute}
                        className="focus:border-accent-500 focus:ring-accent-500 relative -ml-px inline-flex items-center space-x-2 rounded-r-md border border-gray-300 bg-gray-50 px-2 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-1"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      </Link>
                    )}
                  </div>
                )}

                {filteredItems().map((item, idx) => (
                  <ComboboxOption
                    key={idx}
                    disabled={item.disabled}
                    className={({ focus, selected }) =>
                      clsx(
                        "text-foreground hover:bg-tertiary hover:text-secondary-foreground relative cursor-default select-none py-2 pl-3 pr-9 focus:outline-none",
                        !item.disabled && focus && " bg-background text-foreground ",
                        !item.disabled && !focus && " ",
                        item.disabled && "cursor-not-allowed bg-gray-100 text-gray-400",
                        darkMode && !item.disabled && focus && "dark:bg-accent-500 dark:text-black",
                        darkMode && !item.disabled && !focus && "dark:text-gray-50",
                        darkMode && item.disabled && "cursor-not-allowed dark:bg-gray-900 dark:text-gray-600"
                        // selected && "bg-secondary text-secondary-foreground"
                      )
                    }
                    value={item.value}
                  >
                    {({ selected, active }) => (
                      <div className="flex items-center justify-between space-x-2">
                        <div className="flex items-center space-x-2">
                          {selected ? (
                            <div className={clsx(active ? "" : "", " inset-y-0 right-0 flex items-center ")}>
                              {/* <CheckIcon className="h-4 w-4" /> */}<svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_418_2337)">
                                  <path d="M15.8333 3H4.16667C3.25 3 2.5 3.75 2.5 4.66667V16.3333C2.5 17.25 3.25 18 4.16667 18H15.8333C16.75 18 17.5 17.25 17.5 16.3333V4.66667C17.5 3.75 16.75 3 15.8333 3ZM8.925 14.075C8.6 14.4 8.075 14.4 7.75 14.075L4.75833 11.0833C4.43333 10.7583 4.43333 10.2333 4.75833 9.90833C5.08333 9.58333 5.60833 9.58333 5.93333 9.90833L8.33333 12.3083L14.0667 6.575C14.3917 6.25 14.9167 6.25 15.2417 6.575C15.5667 6.9 15.5667 7.425 15.2417 7.75L8.925 14.075Z" fill="#FF7800" />
                                </g>
                                <defs>
                                  <clipPath id="clip0_418_2337">
                                    <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                                  </clipPath>
                                </defs>
                              </svg>

                              {/* <svg xmlns="http://www.w3.org/2000/svg" className="text-foreground h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                              <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                              />
                            </svg> */}
                            </div>
                          ) : <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M15.8333 4.66667V16.3333H4.16667V4.66667H15.8333ZM15.8333 3H4.16667C3.25 3 2.5 3.75 2.5 4.66667V16.3333C2.5 17.25 3.25 18 4.16667 18H15.8333C16.75 18 17.5 17.25 17.5 16.3333V4.66667C17.5 3.75 16.75 3 15.8333 3Z" fill="#D9D9D9"/>
                          </svg>
                          }
                          {withColors && item.color !== undefined && <ColorBadge color={item.color} />}
                          <div className={clsx(selected ? "font-normal" : "font-normal", "truncate")}>{item.name || item.value}</div>
                        </div>


                      </div>
                    )}
                  </ComboboxOption>
                ))}

                {withSearch && filteredItems().length === 0 && <div className="px-3 py-2 text-sm text-gray-400">{t("shared.noRecords")}</div>}
              </ComboboxOptions>
            </Transition>
          </div>
        </div>
      )}
    </Combobox>
  );
};

export default forwardRef(InputCombobox);
