import * as React from "react";
import { useNavigate } from "@remix-run/react";

interface AddViewProps {
  className?: string;
  label?: React.ReactNode;
  onClick?: () => void;
  to?: string;
  disabled?: boolean;
}

export const ViewButton: React.FC<AddViewProps> = ({ className, label = "Add View", onClick, to, disabled = false }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else if (onClick) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`border-border text-text-strong flex flex-col items-center justify-center border border-dashed bg-white px-4 py-2 !text-sm leading-loose shadow-[6px] font-normal${
        className || ""
      } ${disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"} rounded-[6px]`}
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !disabled) {
          handleClick();
        }
      }}
      style={{ cursor: disabled ? "not-allowed" : "pointer" }}
      aria-disabled={disabled}
    >
      <span className="gap-2 self-stretch">{label}</span>
    </button>
  );
};

export default ViewButton;
