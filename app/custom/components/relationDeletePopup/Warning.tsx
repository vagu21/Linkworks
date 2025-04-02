import React from "react";

interface WarningHeaderProps {
  title: string;
}

const WarningHeader: React.FC<WarningHeaderProps> = ({ title }) => {
  return (
    <header className="flex w-full items-center justify-center gap-2.5">
      <div className="h-[20px] w-[20px]">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 5.40833L16.275 16.25H3.725L10 5.40833ZM10 2.08333L0.833334 17.9167H19.1667L10 2.08333ZM10.8333 13.75H9.16667V15.4167H10.8333V13.75ZM10.8333 8.75H9.16667V12.0833H10.8333V8.75Z"
            fill="#FE2424"
          />
        </svg>
      </div>
      <h2 className="text-[#FE2424] flex-1 text-base font-semibold leading-6">{title}</h2>
    </header>
  );
};

export default WarningHeader;
