import clsx from "clsx";
import { useTranslation } from "react-i18next";
import React from "react";
import SearchTableIcon from "~/components/ui/icons/SearchTableIcon";

interface Props {
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  onNew?: () => void;
  onNewRoute?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function TableSearch({
  value,
  setValue,
  onNew,
  onNewRoute,
  placeholder,
  className,
  disabled,
}: Props) {
  const { t } = useTranslation();

  return (
    <div className={clsx("flex justify-between space-x-2", className)}>
      <div className="relative flex w-full flex-auto items-center rounded-md border border-#[f0f0f0] bg-background-subtle shadow-sm">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchTableIcon/>

        </div>
        <input
          type="text"
          className="pl-9 max-w-[342px] w-full text-sm rounded-md focus:ring-0 placeholder-[#BFBFBF] border-black"
          placeholder={placeholder ?? t("shared.searchDot")}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          autoComplete="off"
          disabled={disabled}
        />
      </div>
      {onNew && (
        <button
          onClick={onNew}
          className="flex flex-col justify-center items-start px-4 py-1 text-sm leading-loose bg-background-subtle rounded-md border border-border shadow-sm text-[#BFBFBF] font-normal"
        >
          {t("shared.new")}
        </button>
      )}
      {onNewRoute && (
        <a
          href={onNewRoute}
          className="flex flex-col justify-center items-start px-4 py-1 text-sm leading-loose bg-background-subtle rounded-md border border-border shadow-sm text-[#BFBFBF] font-normal"
        >
          {t("shared.new")}
        </a>
      )}
    </div>
  );
}