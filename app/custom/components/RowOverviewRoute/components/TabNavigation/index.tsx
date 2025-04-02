interface TabNavigationProps {
  tabs?: string[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  tabCounts?: Record<string, number>;
}

const TabNavigation = ({ tabs = ["Details", "Job Applications", "Contract"], activeTab, onTabChange, tabCounts = {}, }: TabNavigationProps) => {
  return (
    <nav
      // style={{ backgroundColor: "rgba(249, 250, 251, 0.47)" }}
      className=" b-t-0 b-x-0 flex min-h-12 w-full flex-wrap items-start gap-4 sm:gap-6 border-b  border-zinc-100 pl-4  text-xs leading-6 text-black text-opacity-60 max-md:max-w-full lg:gap-8"
    >
      {tabs.map((tab) => (
        <button
          key={tab}
          onClick={() => onTabChange(tab)}
          className={`group flex min-h-12 items-center gap-3 self-stretch py-3 transition-colors duration-200 ${activeTab === tab ? "whitespace-nowrap border-b-2 border-zinc-900 font-semibold text-zinc-900" : "text-zinc-500 hover:text-zinc-700"
            }`}
          aria-pressed={activeTab === tab}
        >
          <div className="flex items-center">
            {tab === "Activity Log" ? (
              <div className="pr-1">
                <svg width="16" height="16" viewBox="0 0 16 16" className="fill-current text-inherit" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 2C5.68667 2 3 4.68667 3 8H1L3.59333 10.5933L3.64 10.6867L6.33333 8H4.33333C4.33333 5.42 6.42 3.33333 9 3.33333C11.58 3.33333 13.6667 5.42 13.6667 8C13.6667 10.58 11.58 12.6667 9 12.6667C7.71333 12.6667 6.54667 12.14 5.70667 11.2933L4.76 12.24C5.84667 13.3267 7.34 14 9 14C12.3133 14 15 11.3133 15 8C15 4.68667 12.3133 2 9 2ZM8.33333 5.33333V8.66667L11.1667 10.3467L11.68 9.49333L9.33333 8.1V5.33333H8.33333Z" />
                </svg>
              </div>
            ) : (
              ""
            )}
            <div className="flex flex-row gap-3">
              <div>
                {tab}
              </div>
              <div>
                {tabCounts[tab] !== undefined && tabCounts[tab] > 0 && (
                  <span
                    className={`inline-flex flex-col gap-2 justify-center items-center px-1.5 py-0 rounded-md bg-zinc-100 hover:bg-[#FFF3D6] h-[22px] w-[22px]`}
                    aria-label={`Count: ${tabCounts[tab]}`}
                  >
                    <span className="relative gap-2 text-xs font-bold leading-6 text-neutral-900">
                      {tabCounts[tab]}
                    </span>
                  </span>

                )}
              </div>
            </div>

          </div>
        </button>
      ))}
    </nav>
  );
};

export default TabNavigation;
