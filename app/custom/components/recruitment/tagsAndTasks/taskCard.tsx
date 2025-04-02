"use client";

import { useSubmit } from "@remix-run/react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { useAppOrAdminData } from "~/utils/data/useAppOrAdminData";
import { RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
  confirmMessage: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, message, confirmMessage }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-80 rounded-lg bg-white p-6 shadow-lg">
        <div>
          <div className="flex gap-2 mb-4">
            <svg width="20" height="16" viewBox="0 0 20 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M10.0007 3.40825L16.2757 14.2499H3.72565L10.0007 3.40825ZM10.0007 0.083252L0.833984 15.9166H19.1673L10.0007 0.083252ZM10.834 11.7499H9.16732V13.4166H10.834V11.7499ZM10.834 6.74992H9.16732V10.0833H10.834V6.74992Z"
                fill="#FE2424"
              />
            </svg>
            <div className="text-base font-semibold text-red-600">Delete Task</div>
          </div>
          <p className="mb-4 text-base text-gray-800">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <button className="rounded-lg border border-[#D9D9D9] bg-white px-3 py-1 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button className="rounded-lg bg-red-600 px-3 py-1 text-sm text-white" onClick={onConfirm}>
            {confirmMessage}
          </button>
        </div>
      </div>
    </div>
  );
};

interface TaskHeaderProps {
  item: any;
  onConfirmAction: any;
  title: string;
  author: string;
  date: string;
  canDelete: any;
  onDeleteTask: any;
  onEdit: () => void;
  onMarkDone: any;
}

const TaskBadge = ({ status, variant }: any) => {
  const variants: any = {
    Pending: "text-orange-500 bg-orange-50",
    Done: "text-black bg-gray-200",
  };

  return (
    <div className={`flex items-start whitespace-nowrap text-center text-xs font-medium leading-normal bg-blend-multiply`}>
      <div className={`self-stretch rounded-xl px-1.5 py-px font-medium ${variants[variant]}`}>{status == "Completed" ? "Done" : status}</div>
    </div>
  );
};

const TaskHeader = ({ item, title, author, date, onDeleteTask, canDelete, onConfirmAction, onEdit, onMarkDone }: TaskHeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  return (
    <div className="flex w-full items-start">
      <div className="w-[90%] flex-1 shrink basis-0">
        <h3 className="w-full truncate text-xs font-semibold leading-4 text-gray-900">{title}</h3>
        <p className="text-xs leading-none text-gray-500">
          Added by <span className="inline-block truncate align-middle">{author}</span> ({date})
        </p>
      </div>
      <div>
        <button className="rounded-full p-1 focus:outline-none" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9.66903 6.42692C10.4678 6.42692 11.1213 5.77342 11.1213 4.97469C11.1213 4.17596 10.4678 3.52246 9.66903 3.52246C8.8703 3.52246 8.2168 4.17596 8.2168 4.97469C8.2168 5.77342 8.8703 6.42692 9.66903 6.42692ZM9.66903 7.87915C8.8703 7.87915 8.2168 8.53265 8.2168 9.33138C8.2168 10.1301 8.8703 10.7836 9.66903 10.7836C10.4678 10.7836 11.1213 10.1301 11.1213 9.33138C11.1213 8.53265 10.4678 7.87915 9.66903 7.87915ZM9.66903 12.2358C8.8703 12.2358 8.2168 12.8893 8.2168 13.6881C8.2168 14.4868 8.8703 15.1403 9.66903 15.1403C10.4678 15.1403 11.1213 14.4868 11.1213 13.6881C11.1213 12.8893 10.4678 12.2358 9.66903 12.2358Z"
              fill="#98A2B3"
            />
          </svg>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 z-10 w-40 rounded-md border border-gray-200 bg-white shadow-md">
            <ul className="text-sm text-gray-700">
              <li
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  onMarkDone(item.id);
                  setIsMenuOpen(false);
                }}
              >
                {item.completed ? "Mark as Pending" : "Mark as Done"}
              </li>
              <li
                className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                onClick={() => {
                  onEdit();
                  setIsMenuOpen(false);
                }}
              >
                Edit
              </li>
              <li
                className="cursor-pointer px-4 py-2 text-red-500 hover:bg-gray-100"
                onClick={() => {
                  if (canDelete(item)) {
                    onConfirmAction(() => onDeleteTask(item.id), "Are you sure you want to delete the selected task?", "Yes, Delete");
                  }
                  setIsMenuOpen(false);
                }}
              >
                Delete
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

const PriorityBadge = ({ status="Low", variant="Low" }: any) => {
  const variants: any = {
    Medium: "text-orange-500 bg-orange-50",
    High: "text-red-600",
    Low: "text-green-400",
  };

  return (
    <div className={`flex items-start whitespace-nowrap text-center text-xs font-medium leading-normal bg-blend-multiply`}>
      <div className={` self-stretch rounded-xl bg-[#FEF1F0] px-1.5 py-px font-medium ${variants[variant]}`}>
        {" "}
        Priority: <span className="font-bold">{status}</span>
      </div>
    </div>
  );
};

const TaskFooter = ({ timeAgo, priority }: any) => {
  return (
    <div className="mt-3 flex w-full items-start gap-4">
      <div className="flex flex-1 shrink basis-0 items-start justify-between text-xs leading-none text-gray-500">
        <p className="w-full flex-1 shrink">{timeAgo}</p>
      </div>
      <PriorityBadge status={priority} variant={priority} />
    </div>
  );
};

const TaskCard = ({ item, status, open, setIsOpen, setTaskEdit }: any) => {
  const appOrAdminData = useAppOrAdminData();
  const submit = useSubmit();
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    message: string;
    confirmMessage: string;
    action: (() => void) | null;
  }>({
    isOpen: false,
    message: "",
    confirmMessage: "",
    action: null,
  });

  function onConfirmAction(action: () => void, message: string, confirmMessage: string) {
    setModalState({
      isOpen: true,
      message,
      confirmMessage,
      action,
    });
  }

  function onToggleTaskCompleted(id: string) {
    const form = new FormData();
    form.set("action", "task-complete-toggle");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function onDeleteTask(id: string) {
    const form = new FormData();
    form.set("action", "task-delete");
    form.set("task-id", id);
    submit(form, {
      method: "post",
    });
  }

  function canDelete(item: RowTaskWithDetails) {
    return appOrAdminData.isSuperUser || (!item.completed && item.createdByUserId === appOrAdminData.user?.id);
  }

  const handleEditOpen = () => {
    setTaskEdit(item);
    setIsOpen(true);
  };

  const createdAt = new Date(item.createdAt);
  const date = createdAt
    .toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
    .replace(",", " |");
  const timeAgo = formatDistanceToNow(createdAt, { addSuffix: true });
  const formattedTimeAgo = timeAgo
    .replace("about", "")
    .replace("minutes", "mins")
    .replace("minute", "min")
    .replace("hours", "hrs")
    .replace("hour", "hr")
    .replace("days", "day")
    .replace("day", "day")
    .replace("months", "months")
    .replace("month", "month");

  return (
    <>
      <article
        className={`my-[10px] rounded-lg border-l-4 ${
          item.completed ? "border-green-600" : "border-orange-500"
        } bg-white p-3 shadow-[0px_1px_1px_rgba(16,24,40,0.05)]`}
      >
        <div className="flex w-full flex-col">
          <TaskHeader
            item={item}
            title={item.title}
            author={appOrAdminData.user.firstName}
            date={date}
            canDelete={canDelete}
            onDeleteTask={onDeleteTask}
            onEdit={() => handleEditOpen()}
            onConfirmAction={onConfirmAction}
            onMarkDone={onToggleTaskCompleted}
          />
          <div className="mt-4">
            <TaskBadge status={status} variant={status} />
          </div>
        </div>
        <div className="mt-3 flex min-h-0 w-full border-b border-zinc-100" />
        <TaskFooter timeAgo={formattedTimeAgo} priority={item.priority} />
      </article>
      <ConfirmationModal
        isOpen={modalState.isOpen}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={() => {
          modalState.action?.();
          setModalState((prev) => ({ ...prev, isOpen: false }));
        }}
        message={modalState.message}
        confirmMessage={modalState.confirmMessage}
      />
    </>
  );
};

export default TaskCard;
