import * as React from "react";

interface DownloadButtonProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

export function DownloadButton({ text, onClick }: DownloadButtonProps) {
  return (
    <button
      className="gap-1 self-stretch px-2 py-px text-xs leading-loose rounded border border-[#D9D9D9] text-[#000000] text-opacity-80 bg-[#fafafa] transition-color"
      tabIndex={0}
      aria-label={text}
      onClick={onClick}
    >
      {text}
    </button>
  );
}