import { Link } from "@remix-run/react";
import { TFunction } from "i18next";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import { InputType } from "~/application/enums/shared/InputType";
import InputNumber from "~/components/ui/input/InputNumber";
import InputSelect from "~/components/ui/input/InputSelect";
import InputText from "~/components/ui/input/InputText";

function getChild(value: any): any {
  if (value && value.props && value.props.children) {
    return getChild(value.props.children);
  }
  return value;
}

function getRowValue<T>(t: TFunction, header: RowHeaderDisplayDto<T>, item: T, idxRow: number): string {
  let value: any;

  if (!header.setValue) {
    value = header.formattedValue ? header.formattedValue(item, idxRow) : header.value(item, idxRow);
  } else if (
    header.type === undefined ||
    header.type === InputType.TEXT ||
    header.type === InputType.NUMBER ||
    header.type === InputType.SELECT
  ) {
    value = header.value(item, idxRow);
  } else {
    return "";
  }
 
    value = getChild(value.props.children);
  

  return typeof value === "string" ? value : "";
}

function displayRowValue<T>(t: TFunction, header: RowHeaderDisplayDto<T>, item: T, idxRow: number) {
  return (
    <>
      {!header.setValue ? (
        <>
          {header.href !== undefined && header.href(item) ? (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              to={header.href(item) ?? ""}
              className="rounded-md border-b border-dashed border-transparent hover:border-gray-400 focus:bg-gray-100"
            >
              <span>{header.formattedValue ? header.formattedValue(item, idxRow) : header.value(item, idxRow)}</span>
            </Link>
          )
            : header.property?.subtype === "url" && header.value(item, idxRow) ? (
              <div className="max-w-xs truncate underline hover:text-[#FF7800] ">
              <a
                href={header.value(item, idxRow)}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  window.open(header.value(item, idxRow), "_blank");
                }}
              >
                {header.value(item, idxRow)}
              </a>
              </div>

            ) :
              (
                <span>
                  {header.name === "endDate" && !header.value(item, idxRow)
                    ? "N/A"
                    : header.formattedValue
                      ? header.formattedValue(item, idxRow)
                      : header.value(item, idxRow)}
                </span>
              )}
        </>
      ) : (
        <>
          {header.type === undefined || header.type === InputType.TEXT ? (
            <InputText
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item, idxRow)}
              setValue={(e) => {
                if (header.setValue) {
                  header.setValue(e, idxRow);
                }
              }}
              required={!header.inputOptional}
            />
          ) : header.type === InputType.NUMBER ? (
            <InputNumber
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item)}
              setValue={(e) => {
                if (header.setValue) {
                  header.setValue(e, idxRow);
                }
              }}
              required={!header.inputOptional}
              step={header.inputNumberStep}
            />
          ) : header.type === InputType.SELECT ? (
            <InputSelect
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              setValue={(e) => {
                if (header.setValue) {
                  header.setValue(Number(e), idxRow);
                }
              }}
              options={header.options ?? []}
              required={!header.inputOptional}
              disabled={header.editable && !header.editable(item)}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default {
  getRowValue,
  displayRowValue,
};
