"use client";
import React from "react";
type CardActionMenuItem  = {
  label: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
};

const ArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="19" viewBox="0 0 15 19" fill="none">
        <path d="M14.0563 9.96449C14.6479 9.60076 14.6479 8.66487 14.0563 8.30114L1.78358 0.755466C1.25533 0.430684 0.500001 0.803022 0.500001 1.58714L0.5 16.6785C0.5 17.4626 1.25533 17.8349 1.78358 17.5102L14.0563 9.96449Z" fill="white" stroke="#E6E6E6" />
    </svg>
);

const RelationCardMenu: React.FC<{ menuItems: CardActionMenuItem [] }> = ({ menuItems }) => {
  return (
    <div className="flex items-center">
      <nav className="flex flex-col gap-1 items-start p-1 bg-white rounded-lg border border-solid shadow-lg border-[#E6E6E6] max-sm:p-1">
        {menuItems.map((item, index) => (
          <React.Fragment key={index}>
            <button
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-pointer w-full text-sm font-medium ${
                item.className || "text-[#262626] hover:bg-[#FFEFC9]"
              }`}
              onClick={item.onClick}
              aria-label={item.label}
            >
              {item.icon && <span className="flex items-center justify-center">{item.icon}</span>}
              {item.label}
            </button>
            {index < menuItems.length - 1 && <div className="self-stretch h-px bg-[#E6E6E6]" aria-hidden="true" />}
          </React.Fragment>
        ))}
      </nav>
      <div className="flex items-center justify-center">
        <ArrowIcon />
      </div>
    </div>
  );
};

export default RelationCardMenu;