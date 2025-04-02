import { useNavigation, useSubmit } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";

const AddTaskForm = ({ onClose, task,setTask }: { onClose: () => void; task: any,setTask:any }) => {
  const [taskTitle, setTaskTitle] = useState(task == null ? "" : task?.title);
  const [taskDescription, setTaskDescription] = useState(task == null ? "" : task?.description);
  const [priority, setPriority] = useState(task == null ? "" : task?.priority);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);
  const navigation = useNavigation();
  const isAdding = navigation.state === "submitting" && navigation.formData?.get("action") === "task-new";
  const submit = useSubmit();
  const [error, setError] = useState("");

  function handleFormSubmit(e:any) {
    e.preventDefault();
    const form = new FormData();
    if (!priority) {
      setError("Priority is required.");
      return;
    }
    setError("");

    form.set("action", task == null ? "task-new" : "task-edit");
    if (task != null) form.set("task-id", task.id);
    form.set("task-title", taskTitle);
    form.set("task-description", taskDescription);
    form.set("priority", priority);
    submit(form, {
      method: "post",
    });

    if (task == null) {
      formRef.current?.reset();
      onClose();
    } else {
      setTask({ ...task, title: taskTitle, description: taskDescription, priority });
      onClose();
    }
  }

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  
  }, [isAdding]);

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black bg-opacity-30">
      <div className="relative w-[374px] translate-x-0 transform rounded-l-md bg-white p-4 shadow-lg transition-transform duration-300 ease-in-out">
        <button className="absolute right-2 top-2 text-xl font-bold" onClick={onClose}>
          &times;
        </button>

        <h2 className="mb-4 text-lg font-semibold">Add Task</h2>
        <form ref={formRef} onSubmit={handleFormSubmit}>
          <input hidden readOnly name="action" value="task-new" />
          <input hidden name="priority" value={priority} />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Task Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={taskTitle}
              name="task-title"
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Ex: Need hiring on urgent basis"
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Enter Task</label>
            <textarea
              value={taskDescription}
              name="task-description"
              onChange={(e) => setTaskDescription(e.target.value)}
              placeholder="Ex: Need to hire product designers for the new upcoming project with 3y experience."
              rows={3}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            ></textarea>
          </div>

          <div className="relative mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Priority <span className="text-red-500">*</span>
            </label>
            <div
              className="mt-1 flex cursor-pointer items-center justify-between rounded-md border border-gray-300 p-2"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <span className={priority ? "text-black" : "text-gray-400"}>{priority || "Select"}</span>
              <svg
                className={`h-4 w-4 transform transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>

            {isDropdownOpen && (
              <ul className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-md">
                {["High", "Medium", "Low"].map((level) => (
                  <li
                    key={level}
                    className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                    onClick={() => {
                      setPriority(level);
                      setIsDropdownOpen(false);
                    }}
                  >
                    {level}
                  </li>
                ))}
              </ul>
            )}
            {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
          </div>

          <div className="mt-4 flex justify-end gap-4">
            <button className="rounded-md border border-gray-400 px-4 py-2 text-gray-700 hover:bg-gray-100" onClick={onClose}>
              Cancel
            </button>
            {/* <button className="rounded-md bg-[#4B2E2E] px-4 py-2 text-white transition hover:bg-[#3a2323]" onClick={handleAddTask}> */}
            <button className="rounded-md bg-[#4B2E2E] px-4 py-2 text-white transition hover:bg-[#3a2323]" type="submit">
              {task == null ? `Add Task` : `Update Task`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddTaskForm;
