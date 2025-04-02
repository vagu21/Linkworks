import React from "react";

interface DeleteButtonProps {
  onClick: () => void;
}

function DeleteButton({ onClick }: DeleteButtonProps) {
  return (
    <button
      onClick={onClick}
      className="text-[#FFFFFF] bg-[#FE2424] hover:bg-[#DA0301] focus:ring-destructive-foreground flex min-h-8 w-[107px] flex-col items-center justify-center rounded-md px-4 py-1 shadow-[0px_2px_0px_0px_rgba(5,145,255,0.10)] focus:outline-none focus:ring-2"
      aria-label="Confirm deletion"
    >
      <span className="flex min-h-8 items-center justify-center gap-2 self-stretch">Yes, Delete</span>
    </button>
  );
}

export default DeleteButton;
