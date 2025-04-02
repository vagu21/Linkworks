import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import { Input } from "../../input";

export interface RefInputUrl {
  input: RefObject<HTMLInputElement> | RefObject<HTMLTextAreaElement>;
}

interface Props {
  name?: string;
  title?: string;
  withLabel?: boolean;
  defaultValue?: string | undefined;
  value?: string | undefined;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  className?: string;
  classNameBg?: string;
  minLength?: number;
  maxLength?: number;
  readOnly?: boolean;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  withTranslation?: boolean;
  translationParams?: string[];
  placeholder?: string;
  pattern?: string;
  rows?: number;
  button?: ReactNode;
  lowercase?: boolean;
  uppercase?: boolean;
  type?: string;
  darkMode?: boolean;
  hint?: ReactNode;
  help?: string;
  onBlur?: () => void;
  borderless?: boolean;
  autoFocus?: boolean;
}
const InputUrl = (
  {
    name,
    title,
    withLabel = true,
    defaultValue,
    value,
    setValue,
    className,
    classNameBg,
    help,
    disabled = false,
    readOnly = false,
    required = false,
    minLength,
    maxLength,
    autoComplete,
    withTranslation = false,
    translationParams = [],
    placeholder,
    pattern,
    hint,
    rows,
    button,
    lowercase,
    uppercase,
    type = "text",
    darkMode,
    onBlur,
    borderless,
    autoFocus,
  }: Props,
  ref: Ref<RefInputUrl>
) => {
  const { t, i18n } = useTranslation();

  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [isValid, setIsValid] = useState<boolean>(false);
  const [classNameInput, setClassNameInput] = useState<string>(``);
  useEffect(() => {
    if (!value) setClassNameInput('')
    const isValid = value?.match(/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/);
    setIsValid(isValid ? true : false);
    if (value)
      setClassNameInput(isValid ? "" : "border-warning  focus-visible:border-warning focus-visible:ring-warning");
  }, [value]);

  function getTranslation(value: string) {
    if (!i18n.exists(value)) {
      return null;
    }
    return t(value);
  }

  function onChange(value: string) {
    if (setValue) {
      if (lowercase) {
        setValue(value.toLowerCase());
      } else if (uppercase) {
        setValue(value.toUpperCase());
      } else {
        setValue(value);
      }
    }
  }

  return (
    <div className={clsx(className, !darkMode && "flex flex-col gap-[2px]")}>
      {withLabel && (
        <label htmlFor={name} className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
          <div className="flex items-center space-x-1 truncate">
            <div className="flex space-x-1 truncate">
              <div className="truncate text-body font-normal text-label">{title}</div>
              {required && title && <div className="ml-1 text-red-500">*</div>}
            </div>
            <div className="">{help && <HintTooltip text={help} />}</div>
          </div>
          {withTranslation && value?.includes(".") && (
            <div className="truncate font-light italic text-slate-600" title={t(value, { 0: translationParams })}>
              {t("admin.pricing.i18n")}:{" "}
              {getTranslation(value) ? (
                <span className="text-slate-600">{t(value, { 0: translationParams })}</span>
              ) : (
                <span className="text-red-600">{t("shared.invalid")}</span>
              )}
            </div>
          )}
          {hint}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 pr-2  text-label bg-[#F8F8F8]  rounded-lg">
          
          <div>
            <svg className="h-4 w-5" viewBox="0 0 10 6" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <g transform="scale(0.7) translate(1.5, 0.9)">
                <path d="M7.5 0.5H5.5V1.5H7.5C8.325 1.5 9 2.175 9 3C9 3.825 8.325 4.5 7.5 4.5H5.5V5.5H7.5C8.88 5.5 10 4.38 10 3C10 1.62 8.88 0.5 7.5 0.5ZM4.5 4.5H2.5C1.675 4.5 1 3.825 1 3C1 2.175 1.675 1.5 2.5 1.5H4.5V0.5H2.5C1.12 0.5 0 1.62 0 3C0 4.38 1.12 5.5 2.5 5.5H4.5V4.5ZM3 2.5H7V3.5H3V2.5Z" fill="#151B21" />
              </g>
            </svg>
          </div>

        </div>
        <div className="relative w-full">
          <Input
            ref={input}
            type={type}
            id={name}
            name={name}
            autoComplete={autoComplete}
            required={required}
            minLength={minLength}
            maxLength={maxLength}
            defaultValue={defaultValue}
            value={value}
            onChange={(e) => onChange(e.currentTarget.value)}
            onBlur={onBlur}
            disabled={disabled}
            readOnly={readOnly}
            placeholder={placeholder}
            pattern={pattern !== "" && pattern !== undefined ? pattern : undefined}
            autoFocus={autoFocus}
            className={clsx("pl-10 rounded-lg", classNameInput)}
          // className={clsx(
          //   "focus:border-accent-500 focus:ring-accent-500 block w-full min-w-0 flex-1 rounded-md border-gray-300 sm:text-sm",
          //   className,
          //   classNameBg,
          //   disabled || readOnly ? "cursor-not-allowed bg-gray-100" : "hover:bg-gray-50 focus:bg-gray-50",
          //   "px-10",
          //   borderless && "border-transparent",
          //   !(disabled || readOnly) &&
          //     clsx(
          //       isValid
          //         ? "border-teal-500 focus:border-teal-500 focus:ring-teal-500"
          //         : value
          //         ? "focus:border-accent-500 focus:ring-accent-500 border-red-300"
          //         : "focus:border-accent-500 focus:ring-accent-500 border-gray-300"
          //     )
          // )}
          />
          {/* {!(disabled || readOnly) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? <CheckIcon className="h-4 w-4 text-teal-500" /> : value ? <ExclamationTriangleIcon className="h-4 w-4 text-red-500" /> : null}
          </div>
        )} */}
          {classNameInput ?
            <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM6.5 3.625C6.5 3.55625 6.55625 3.5 6.625 3.5H7.375C7.44375 3.5 7.5 3.55625 7.5 3.625V7.875C7.5 7.94375 7.44375 8 7.375 8H6.625C6.55625 8 6.5 7.94375 6.5 7.875V3.625ZM7 10.5C6.80374 10.496 6.61687 10.4152 6.47948 10.275C6.3421 10.1348 6.26515 9.9463 6.26515 9.75C6.26515 9.5537 6.3421 9.36522 6.47948 9.225C6.61687 9.08478 6.80374 9.00401 7 9C7.19626 9.00401 7.38313 9.08478 7.52052 9.225C7.6579 9.36522 7.73485 9.5537 7.73485 9.75C7.73485 9.9463 7.6579 10.1348 7.52052 10.275C7.38313 10.4152 7.19626 10.496 7 10.5Z" fill="#FAAD14" />
            </svg> : !classNameInput && value ? <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM11.0234 5.71406L7.73281 10.2766C7.68682 10.3408 7.62619 10.3931 7.55595 10.4291C7.48571 10.4652 7.40787 10.4841 7.32891 10.4841C7.24994 10.4841 7.17211 10.4652 7.10186 10.4291C7.03162 10.3931 6.97099 10.3408 6.925 10.2766L4.97656 7.57656C4.91719 7.49375 4.97656 7.37813 5.07812 7.37813H5.81094C5.97031 7.37813 6.12187 7.45469 6.21562 7.58594L7.32812 9.12969L9.78438 5.72344C9.87813 5.59375 10.0281 5.51562 10.1891 5.51562H10.9219C11.0234 5.51562 11.0828 5.63125 11.0234 5.71406Z" fill="#52C41A" />
            </svg> : <></>

          }
        </div>

        {button}
      </div>
    </div>
  );
};
export default forwardRef(InputUrl);
