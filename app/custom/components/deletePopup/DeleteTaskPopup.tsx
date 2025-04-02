"use client";

import React from "react";
import CancelButton from "./CancelButton";
import DeleteButton from "./DeleteButton";

interface DeleteTaskPopupProps {
  onDelete: () => void;
  onCancel: () => void;
}

function DeleteTaskPopup({ onDelete, onCancel }: DeleteTaskPopupProps) {
  return (
    <section className="flex w-full max-w-[360px] flex-col rounded-xl bg-white p-6 shadow-lg">
      <header className="w-full text-base">
        <div className="text-[#FE2424] flex w-full items-center justify-center gap-2.5 font-semibold leading-6">
          <img
            src="https://cdn.builder.io/api/v1/image/assets/fcdf5e37ffe046d1b92f50e2f9bf9d3a/993dfc11c824ec26d99ff5ae83ac3579d9fadf323de22d3752b84ac78324136b?placeholderIfAbsent=true"
            alt="Warning icon"
            className="my-auto aspect-square w-5 shrink-0 self-stretch object-contain"
          />
          <h2 className="my-auto flex-1 shrink basis-0 self-stretch">Delete Task</h2>
        </div>
        <p className="text-secondary-foreground mt-3 font-normal leading-6">
          Are you sure you want to delete the <br />
          task?
        </p>
      </header>
      <footer className="mt-6 flex items-start gap-1 self-end text-sm leading-loose">
        <CancelButton onClick={onCancel} />
        <DeleteButton onClick={onDelete} />
      </footer>
    </section>
  );
}

export default DeleteTaskPopup;
