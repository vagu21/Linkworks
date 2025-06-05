import React, { useState } from "react";
import TagsAndTasks from "./tagsAndTasks";
import Activities from "./activityLogs";
import TabNavigation from "../RowOverviewRoute/components/TabNavigation";

export default function ActionsBar({ rowData, options, onSubmit, onToggle }: any) {
  const [activeTab, setActiveTab] = useState<string>("Tags and Tasks");

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };
  return (
    <>
      <div className="flex gap-2">
        <button className="hidden sm:block" onClick={onToggle}>
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" fill="none">
            <path
              d="M14 12H5.33333V10.6667H14V12ZM14 8.66667H7.33333V7.33333H14V8.66667ZM14 4V5.33333H5.33333V4H14ZM2 10.3933L4.38667 8L2 5.60667L2.94 4.66667L6.27333 8L2.94 11.3333L2 10.3933Z"
              fill="#291400"
            />
          </svg>
        </button>
        <div className="text-lg font-semibold pb-[1px]">Actions</div>
      </div>
      <div>
        <div className={"-mx-4 flex w-full items-start pb-4 pt-4 text-xs leading-6"}>
          <TabNavigation tabs={["Tags and Tasks", "Activity Log"]} activeTab={activeTab} onTabChange={handleTabChange} />
        </div>
        <div>
          {activeTab === "Tags and Tasks" ? (
            <TagsAndTasks rowData={rowData} options={options} />
          ) : (
            <Activities rowData={rowData} options={options} onSubmit={onSubmit} />
          )}
        </div>
      </div>
    </>
  );
}