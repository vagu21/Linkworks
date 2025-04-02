import React from "react";

interface ActionButtonsProps {
  onCancel?: () => void;
  onDelete?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({ onCancel, onDelete }) => {
  return (
    <div className="flex w-full items-end justify-end gap-1">
      <button
        onClick={onCancel}
        className="bg-table border-border text-headings hover:bg-[#F2F2F2] h-8 gap-2 rounded-md border px-4 text-sm leading-6 shadow-sm transition-colors"
        aria-label="Cancel deletion"
      >
        No, Cancel
      </button>
      <button
        onClick={onDelete}
        className="hover:bg-[#DA0301] h-8 w-[107px] gap-2 rounded-md bg-red-600 px-4 text-sm leading-6 text-white shadow-sm transition-colors"
        aria-label="Confirm deletion"
      >
        Yes, Delete
      </button>
    </div>
  );
};

export default ActionButtons;
