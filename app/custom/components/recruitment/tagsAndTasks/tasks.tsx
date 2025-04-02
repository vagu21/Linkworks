"use client";
import { useState } from "react";
import TaskCard from "./taskCard";
import AddTaskForm from "./addTask";
import { RowTaskWithDetails } from "~/utils/db/entities/rowTasks.db.server";

export const Tasks = ({ items }: { items: RowTaskWithDetails[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [taskEdit, setTaskEdit] = useState(null);
  const [selected, setSelected] = useState("All");
  const [isFormVisible, setIsFormVisible] = useState(false);


  const filteredItems = items.filter((item) => {
    if (selected === "All") return true;
    if (selected === "Done") return item.completed;
    if (selected === "Pending") return !item.completed;
    return true;
  });

  return (
    <section className="tasks-section px-[4px] py-[10px]">
      <header className="flex items-center gap-2.5 border-b border-gray-200 py-2">
        <h1 className="my-auto flex-1 shrink gap-2 self-stretch whitespace-nowrap text-lg font-semibold text-stone-950">Tasks</h1>
        <div className="my-auto flex items-center gap-2.5 self-stretch">
          <div className="relative">
            <button
              className="my-auto flex h-8 items-center gap-2.5 self-stretch overflow-hidden whitespace-nowrap rounded-lg border border-solid border-zinc-300 bg-white px-3 text-sm text-zinc-900"
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="my-auto flex items-center gap-2.5 self-stretch py-1.5">
                <div>{selected}</div>
                <svg
                  className={`my-auto aspect-square w-4 shrink-0 self-stretch object-contain ${isOpen ? "rotate-180" : "rotate-0"}`}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <ul className="absolute z-10 w-[110px] rounded-md border border-gray-300 bg-white shadow-md">
                {["All", "Pending", "Done"].map((value) => (
                  <li
                    key={value}
                    className="flex cursor-pointer items-center justify-start px-2 py-2 text-sm hover:bg-gray-100"
                    onClick={() => {
                      setSelected(value);
                      setIsOpen(false);
                    }}
                  >
                    {value}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button
            className="my-auto flex h-[32px] w-[32px] items-center justify-center rounded-md border border-solid border-[#E4E7EC] bg-[#291400] shadow-[0px_2px_0px_0px_rgba(0,0,0,0.02)]"
            aria-label="Add new task"
            onClick={() => setIsFormVisible(true)}
          >
            <div className="flex min-h-8 w-8 items-center justify-center gap-2">
              <img
                loading="lazy"
                src="https://cdn.builder.io/api/v1/image/assets/TEMP/ca4f5a200d54675982245b924e49e8eef8c1892900823188c0453c5e3f96cf1a?placeholderIfAbsent=true&apiKey=86147b36fc4a4bfb9addc8a5a8ea4511"
                className="my-auto aspect-square w-4 self-stretch object-contain"
                alt="Add task icon"
              />
            </div>
          </button>

          {isFormVisible && (
            <AddTaskForm
              onClose={() => {
                setIsFormVisible(false);
                setTaskEdit(null);
              }}
              task={taskEdit}
              setTask={setTaskEdit}
            />
          )}
        </div>
      </header>
      <div className="mt-4 space-y-4">
        {filteredItems.length > 0 ? (
          <div className="">
            {filteredItems.map((item) => {
              var status = "Pending";
              if (item.completed) {
                status = "Done";
              }
              return <TaskCard key={item.id} item={item} status={status} open={isFormVisible} setIsOpen={setIsFormVisible} setTaskEdit={setTaskEdit} />;
            })}
          </div>
        ) : (
          <div className="flex text-sm">No Tasks Added</div>
        )}
      </div>
    </section>
  );
};

export default Tasks;
