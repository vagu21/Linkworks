import React from "react";

interface CancelButtonProps {
  onClick: () => void;
}

function CancelButton({ onClick }: CancelButtonProps) {
  return (
    <button
      onClick={onClick}
      className="border-button-secondary-border bg-background text-button-secondary-text hover:bg-[#F2F2F2] focus:ring-button-secondary-border min-h-[32px] items-center justify-center rounded-md border px-4 py-1 focus:outline-none focus:ring-2"
      aria-label="Cancel deletion"
    >
      <span className="flex min-h-8 items-center justify-center gap-2 self-stretch">No, Cancel</span>
    </button>
  );
}

export default CancelButton;
