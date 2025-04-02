"use client";

import React from "react";
import EntityPreview from "./EntityPreview";
import ActionButtons from "./ActionButtons";
import WarningHeader from "./Warning";


interface DeleteConfirmationPopupProps {
  onCancel: () => void;
  onDelete: () => void;
  title : string | null;
  subtitle : string | null; 
  details : string[];
  heading : string;
}

export const DeleteConfirmationPopup: React.FC<DeleteConfirmationPopupProps> = ({ onCancel, onDelete, title, subtitle, details, heading }) => {
  return (
    <section className="flex w-[607px] flex-col items-end gap-6 rounded-xl bg-white p-6 max-md:w-full max-sm:p-4">
      <div className="flex w-full flex-col items-start gap-3">
        <WarningHeader title= {`Delete ${heading}`} />

        <p className="text-secondary-foreground w-full text-base leading-6">Are you sure you want to delete the selected <span className="lowercase">{heading}</span>?</p>

        <EntityPreview
          title={title}
          subtitle={subtitle}
          details={details}
        />
      </div>

      <ActionButtons onCancel={onCancel} onDelete={onDelete} />
    </section>
  );
};
