import { ReactNode, useState } from "react";
import clsx from "clsx";

interface Props {
  title: ReactNode;
  icon?: ReactNode;
  children: ReactNode;
  description?: string;
  className?: string;
  totalFields?: number;
  right?: ReactNode;
  isLast?: boolean;
  defaultOpen?: boolean;
  filled?: number;
  isDrawer?: boolean;
  lineStyle?: React.CSSProperties;
}

export default function InputGroup({
  title,
  description,
  icon,
  children,
  right,
  className,
  lineStyle,
  totalFields,
  isLast,
  filled,
  defaultOpen = true,
  isDrawer,
}: Props) {
  const [isOpen, setIsOpen] = useState(() => !!defaultOpen);

  const toggleOpen = () => setIsOpen(!isOpen);

  // Drawer View
  if (isDrawer) {
    return (
      <div className={clsx("relative")}>
        <div className="">
          {description && <p className="text-sm text-gray-700">{description}</p>}
          <div className={clsx(className)}>{children}</div>
        </div>
      </div>
    );
  }

  return (
    
    <div className={clsx("relative w-full rounded-[12px] border-b-[1px] border-l-[1px] border-r-[1px] border-t-[1px] py-4  border-solid border-[#EAEAEA] bg-white shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12)]")}>
      <div onClick={toggleOpen} className={clsx("flex justify-between items-center px-4",isOpen && "border-b-[1px] border-solid border-[#EAEAEA] w-full pb-[13px] px-4")}>
        <div className={clsx("flex cursor-pointer items-center")}>
          {isOpen ? (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-[-50px] z-10"
            >
              <rect width="28" height="28" rx="8" fill="#180505" />
              <path
                d="M11.4314 11.5C10.7186 11.5 10.3617 12.3617 10.8657 12.8657L13.9343 15.9343C14.2467 16.2467 14.7533 16.2467 15.0657 15.9343L18.1343 12.8657C18.6383 12.3617 18.2814 11.5 17.5686 11.5H11.4314Z"
                fill="#F8F8F8"
              />
            </svg>
          ) : (
            <svg
              width="28"
              height="28"
              viewBox="0 0 28 28"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="absolute left-[-50px] z-10"
            >
              <rect width="28" height="28" rx="8" fill="#FFD600" />
              <path
                d="M12 17.0686C12 17.7814 12.8617 18.1383 13.3657 17.6343L16.4343 14.5657C16.7467 14.2533 16.7467 13.7467 16.4343 13.4343L13.3657 10.3657C12.8617 9.86171 12 10.2186 12 10.9314V17.0686Z"
                fill="#291400"
              />
            </svg>
          )}
          {icon}
          <span
            className={clsx(
              "text-[16px] font-bold leading-[19px] text-[#121212] flex items-center",
              isOpen && ""
            )}
          >
            {title}
          </span>
          <span className={clsx("ml-[2px] text-sm text-[#737373]", isOpen && "")}>
            ({filled}/{totalFields} fields filled)
          </span>
        </div>
        {/* Right Content */}
        {right && <div className="hidden md:flex">{right}</div>}
      </div>

      {/* Description and Content */}
      <div className={`relative px-4`}>
        {/* {isLast ? (
          <div
            className="absolute -left-[60px] z-[0] -top-[20px] border-[1px] border-dashed border-[#9F9F9F]"
            style={{ height: "" }}
          />
        ) : ( */}
          <div
            className="absolute -left-[37px] z-[0] border-[1px] border-dashed border-[#BFBFBF]"
            style={{ height: isLast ? "100%" : "calc(100% + 6rem)",top:isOpen?'-30px':'-24px', ...lineStyle }}
          />
        {/* )}  */}
        {description && <p className="text-sm text-gray-700">{description}</p>}
        {/* Accordion Content */}
        <div className={clsx(isOpen ? "mt-[20px]" : "hidden", className)}>{children}</div>
      </div>
    </div>
  );
}