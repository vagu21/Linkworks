import * as React from "react";
import { useNavigate } from "@remix-run/react";

interface AddButtonProps {
  className?: string;
  label?: React.ReactNode; 
  onClick?: () => void; 
  to?: string; 
  disabled?: boolean; 
}

export const AddButton: React.FC<AddButtonProps> = ({
  className = '',
  label = "Add",
  onClick,
  to,
  disabled = false,
}) => {
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
      className={`flex flex-col justify-center items-center px-4 py-2 !text-sm leading-loose text-primary-foreground font-normal rounded-md bg-primary shadow-[0px_2px_0px_0px_rgba(5,145,255,0.10)] ${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} rounded-[6px]`}
      tabIndex={0}
      aria-disabled={disabled} 
      disabled={disabled} 
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
          handleClick(); 
        }
      }}
    >
      <div className="gap-2 self-stretch">{label}</div>
    </button>
  );
};

export default AddButton;
