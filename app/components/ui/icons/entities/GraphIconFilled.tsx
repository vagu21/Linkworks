import React from "react";

const GraphIconFilled = ({ className }: { className?: string }) => {
  return (
    <div className={className}>
      <svg
        className="h-6 w-6 text-gray-800 dark:text-white"
        aria-hidden="true"
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2.5"
          d="M4 4v15a1 1 0 0 0 1 1h15M8 16l2.5-5.5 3 3L17.273 7 20 9.667"
        />
      </svg>
    </div>
  );
};

export default GraphIconFilled;
