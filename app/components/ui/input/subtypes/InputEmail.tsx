import clsx from "clsx";
import { forwardRef, ReactNode, Ref, RefObject, useEffect, useImperativeHandle, useRef, useState } from "react";
import HintTooltip from "~/components/ui/tooltips/HintTooltip";
import CheckIcon from "../../icons/CheckIcon";
import ExclamationTriangleIcon from "../../icons/ExclamationTriangleIcon";
import { Input } from "../../input";
import { color } from "framer-motion";

export interface RefInputEmail {
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
  placeholder?: string;
  pattern?: string;
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
const InputEmail = (
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
    placeholder,
    pattern,
    hint,
    button,
    lowercase,
    uppercase,
    type = "email",
    darkMode,
    onBlur,
    borderless,
    autoFocus,
  }: Props,
  ref: Ref<RefInputEmail>
) => {
  useImperativeHandle(ref, () => ({ input }));
  const input = useRef<HTMLInputElement>(null);

  const [isValid, setIsValid] = useState<boolean>(false);
  const [classNameInput, setClassNameInput] = useState<string>(``);
  useEffect(() => {
    if(!value)setClassNameInput('')
    const isValid = value?.match(/^([\w.%+-]+)@([\w-]+\.)+([\w]{2,})$/i);
    setIsValid(isValid ? true : false);
    if (value)
      setClassNameInput(isValid ? "" : "border-warning  focus-visible:border-warning focus-visible:ring-warning");
  }, [value]);

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
          {hint}
        </label>
      )}
      <div className={clsx("relative flex w-full rounded-md")}>
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2 pr-2   text-label bg-[#F8F8F8] rounded-lg">
          <div className=" ">
            <svg className="text-label h-4 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M5.404 14.596A6.5 6.5 0 1116.5 10a1.25 1.25 0 01-2.5 0 4 4 0 10-.571 2.06A2.75 2.75 0 0018 10a8 8 0 10-2.343 5.657.75.75 0 00-1.06-1.06 6.5 6.5 0 01-9.193 0zM10 7.5a2.5 2.5 0 100 5 2.5 2.5 0 000-5z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          {/* <svg width="30" className="bl-0" height="60" viewBox="0 0 38 40" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M0 0H32C35.3137 0 38 2.68629 38 6V34C38 37.3137 35.3137 40 32 40H0V0Z" fill="black" fill-opacity="0.02"/>
<path d="M0 0H38H0ZM38 40H0H38ZM-0.5 40V0H0.5V40H-0.5ZM38 0V40V0Z" fill="#D9D9D9"/>
<path d="M18.9403 28.1847C17.9261 28.1847 17.0296 28.0455 16.2507 27.767C15.4718 27.492 14.8172 27.0859 14.2869 26.549C13.7566 26.0121 13.3556 25.3542 13.0838 24.5753C12.812 23.7964 12.6761 22.9048 12.6761 21.9006C12.6761 20.9295 12.8137 20.0611 13.0888 19.2955C13.3672 18.5298 13.7699 17.8802 14.2969 17.3466C14.8272 16.8097 15.4702 16.4003 16.2259 16.1186C16.9848 15.8369 17.8433 15.696 18.8011 15.696C19.7325 15.696 20.5478 15.8485 21.2472 16.1534C21.9498 16.455 22.5365 16.8643 23.0071 17.3814C23.4811 17.8951 23.8357 18.4735 24.071 19.1165C24.3097 19.7595 24.429 20.4223 24.429 21.1051C24.429 21.5857 24.4058 22.0729 24.3594 22.5668C24.313 23.0606 24.2152 23.5147 24.0661 23.929C23.9169 24.34 23.6866 24.6714 23.375 24.9233C23.0668 25.1752 22.6491 25.3011 22.1222 25.3011C21.8902 25.3011 21.6349 25.2647 21.3565 25.1918C21.0781 25.1188 20.8312 24.9979 20.6158 24.8288C20.4003 24.6598 20.2727 24.4328 20.233 24.1477H20.1733C20.0938 24.34 19.9711 24.5223 19.8054 24.6946C19.643 24.867 19.4292 25.0045 19.1641 25.1072C18.9022 25.21 18.5824 25.2547 18.2045 25.2415C17.7737 25.2249 17.3942 25.1288 17.0661 24.9531C16.7379 24.7741 16.4628 24.5322 16.2408 24.2273C16.022 23.919 15.8563 23.5627 15.7436 23.1584C15.6342 22.7507 15.5795 22.3116 15.5795 21.8409C15.5795 21.3935 15.6458 20.9841 15.7784 20.6129C15.911 20.2417 16.0949 19.9169 16.3303 19.6385C16.5689 19.3601 16.8473 19.138 17.1655 18.9723C17.487 18.8033 17.8333 18.6989 18.2045 18.6591C18.536 18.6259 18.8376 18.6409 19.1094 18.7038C19.3812 18.7635 19.6049 18.8546 19.7805 18.9773C19.9562 19.0966 20.0672 19.2292 20.1136 19.375H20.1733V18.8182H21.2273V23.3125C21.2273 23.5909 21.3052 23.8362 21.4609 24.0483C21.6167 24.2604 21.8438 24.3665 22.142 24.3665C22.4801 24.3665 22.7386 24.2505 22.9176 24.0185C23.0999 23.7865 23.2242 23.4285 23.2905 22.9446C23.3601 22.4607 23.3949 21.8409 23.3949 21.0852C23.3949 20.6411 23.3336 20.2036 23.2109 19.7727C23.0916 19.3385 22.9093 18.9325 22.6641 18.5547C22.4221 18.1768 22.1155 17.8437 21.7443 17.5554C21.3731 17.267 20.9373 17.0417 20.4368 16.8793C19.9396 16.7135 19.3745 16.6307 18.7415 16.6307C17.9626 16.6307 17.2649 16.7517 16.6484 16.9936C16.0353 17.2322 15.5133 17.5819 15.0824 18.0426C14.6548 18.5 14.3284 19.0568 14.103 19.7131C13.8809 20.366 13.7699 21.1084 13.7699 21.9403C13.7699 22.7855 13.8809 23.5362 14.103 24.1925C14.3284 24.8487 14.6598 25.4022 15.0973 25.853C15.5381 26.3037 16.0833 26.6451 16.733 26.8771C17.3826 27.1125 18.1316 27.2301 18.9801 27.2301C19.3447 27.2301 19.7043 27.1953 20.0589 27.1257C20.4136 27.0561 20.7268 26.9799 20.9986 26.897C21.2704 26.8142 21.4659 26.7528 21.5852 26.7131L21.8636 27.6278C21.6581 27.714 21.3897 27.8002 21.0582 27.8864C20.7301 27.9725 20.3788 28.0438 20.0043 28.1001C19.633 28.1565 19.2784 28.1847 18.9403 28.1847ZM18.3636 24.2273C18.8078 24.2273 19.1674 24.1378 19.4425 23.9588C19.7176 23.7798 19.9181 23.5097 20.044 23.1484C20.17 22.7872 20.233 22.3314 20.233 21.7812C20.233 21.2244 20.1634 20.7902 20.0241 20.4787C19.8849 20.1671 19.6795 19.9484 19.4077 19.8224C19.1359 19.6965 18.8011 19.6335 18.4034 19.6335C18.0256 19.6335 17.7024 19.733 17.4339 19.9318C17.1688 20.1274 16.965 20.3892 16.8224 20.7173C16.6832 21.0421 16.6136 21.3968 16.6136 21.7812C16.6136 22.2055 16.67 22.6049 16.7827 22.9794C16.8954 23.3506 17.0793 23.6522 17.3345 23.8842C17.5897 24.1129 17.9328 24.2273 18.3636 24.2273Z" fill="#151B21"/>
</svg> */}

        </div>
        <div className="relative w-full">
          <Input
            ref={input}
            type={type}
            id={name}
            name={name}
            autoComplete={"off"}
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
            className={clsx("pl-10 rounded-lg ",classNameInput)}
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
           { classNameInput && value?
            <svg className="absolute right-3 top-1/2 -translate-y-1/2" width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 0C3.13438 0 0 3.13438 0 7C0 10.8656 3.13438 14 7 14C10.8656 14 14 10.8656 14 7C14 3.13438 10.8656 0 7 0ZM6.5 3.625C6.5 3.55625 6.55625 3.5 6.625 3.5H7.375C7.44375 3.5 7.5 3.55625 7.5 3.625V7.875C7.5 7.94375 7.44375 8 7.375 8H6.625C6.55625 8 6.5 7.94375 6.5 7.875V3.625ZM7 10.5C6.80374 10.496 6.61687 10.4152 6.47948 10.275C6.3421 10.1348 6.26515 9.9463 6.26515 9.75C6.26515 9.5537 6.3421 9.36522 6.47948 9.225C6.61687 9.08478 6.80374 9.00401 7 9C7.19626 9.00401 7.38313 9.08478 7.52052 9.225C7.6579 9.36522 7.73485 9.5537 7.73485 9.75C7.73485 9.9463 7.6579 10.1348 7.52052 10.275C7.38313 10.4152 7.19626 10.496 7 10.5Z" fill="#FAAD14" />
            </svg>:!classNameInput && value ?<svg className="absolute right-3 top-1/2 -translate-y-1/2" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM11.0234 5.71406L7.73281 10.2766C7.68682 10.3408 7.62619 10.3931 7.55595 10.4291C7.48571 10.4652 7.40787 10.4841 7.32891 10.4841C7.24994 10.4841 7.17211 10.4652 7.10186 10.4291C7.03162 10.3931 6.97099 10.3408 6.925 10.2766L4.97656 7.57656C4.91719 7.49375 4.97656 7.37813 5.07812 7.37813H5.81094C5.97031 7.37813 6.12187 7.45469 6.21562 7.58594L7.32812 9.12969L9.78438 5.72344C9.87813 5.59375 10.0281 5.51562 10.1891 5.51562H10.9219C11.0234 5.51562 11.0828 5.63125 11.0234 5.71406Z" fill="#52C41A"/>
</svg>:<></>

          }
        </div>
        {/* {!(disabled || readOnly) && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {isValid ? <CheckIcon className="h-4 w-4 text-teal-500" /> : value ? <ExclamationTriangleIcon className="h-4 w-4 text-red-500" /> : null}
          </div>
        )} */}
        {button}
      </div>
    </div>
  );
};
export default forwardRef(InputEmail);
