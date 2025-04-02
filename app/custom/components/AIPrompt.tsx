import clsx from "clsx";
import React, { useEffect } from "react";
import FloatingLoader from "~/components/ui/loaders/FloatingLoader";
import { useProcessMediaFile } from "~/modules/mediaParser/useProcessMedia";

const AIPrompt = ({ showPrompt, setShowAIPrompt, headers, onChange, item, routes, entity }: any) => {
  const [prompt, setPrompt] = React.useState("");
  const addDynamicRow = () => {};
  const childrenEntities = { visible: [], hidden: [] };

  const { parseMediaFile, isLoading } = useProcessMediaFile({
    addDynamicRow,
    childrenEntities,
    entityName: entity.name
  });

  return (
    <>
      {isLoading && (
        <div>
          <FloatingLoader loading={isLoading} />
        </div>
      )}
      <div
        className=" box-shadow: 0px 2px 28.1px -4px #FF8442 relative min-h-[400px] w-[380px] overflow-hidden rounded-3xl bg-[#FF7800] md:min-w-[422px]"
        style={{
          boxShadow: "0px 2px 28.100000381469727px -4px #ff8442",
        }}
      >
        <svg
          width="211"
          height="222"
          viewBox="0 0 211 222"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[541px] top-[139px] opacity-[0.34]"
          preserveAspectRatio="none"
        >
          <g opacity="0.34">
            <circle cx="165.5" cy="165.5" r="165.5" transform="matrix(-1 0 0 1 331 0)" fill="#D9D9D9"></circle>
            <circle cx="165.5" cy="165.5" r="165.5" transform="matrix(-1 0 0 1 331 0)" fill="url(#paint0_linear_1_4069)"></circle>
          </g>
          <defs>
            <linearGradient id="paint0_linear_1_4069" x1="0" y1="165.5" x2="331" y2="165.5" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF7800"></stop>
              <stop offset="1" stop-color="#FFA200"></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width="231"
          height="199"
          viewBox="0 0 231 199"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[-91px] top-[-123px] opacity-[0.34]"
          preserveAspectRatio="none"
        >
          <g opacity="0.34">
            <circle cx="70.5" cy="38.5" r="160.5" fill="#D9D9D9"></circle>
            <circle cx="70.5" cy="38.5" r="160.5" fill="url(#paint0_linear_1_4070)"></circle>
          </g>
          <defs>
            <linearGradient id="paint0_linear_1_4070" x1="-90" y1="38.5" x2="231" y2="38.5" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF7800"></stop>
              <stop offset="1" stop-color="#FFA200"></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width="210"
          height="178"
          viewBox="0 0 210 178"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[-78px] top-[-110px]"
          preserveAspectRatio="none"
        >
          <circle cx="66.5" cy="34.5" r="143.5" fill="#D9D9D9"></circle>
          <circle cx="66.5" cy="34.5" r="143.5" fill="url(#paint0_linear_1_4071)"></circle>
          <defs>
            <linearGradient id="paint0_linear_1_4071" x1="-77" y1="34.5" x2="210" y2="34.5" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF7800"></stop>
              <stop offset="1" stop-color="#FFA200"></stop>
            </linearGradient>
          </defs>
        </svg>
        <svg
          width="189"
          height="200"
          viewBox="0 0 189 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-[519px] top-[161px]"
          preserveAspectRatio="none"
        >
          <circle cx="143.5" cy="143.5" r="143.5" transform="matrix(-1 0 0 1 287 0)" fill="#D9D9D9"></circle>
          <circle cx="143.5" cy="143.5" r="143.5" transform="matrix(-1 0 0 1 287 0)" fill="url(#paint0_linear_1_4072)"></circle>
          <defs>
            <linearGradient id="paint0_linear_1_4072" x1="0" y1="143.5" x2="287" y2="143.5" gradientUnits="userSpaceOnUse">
              <stop stop-color="#FF7800"></stop>
              <stop offset="1" stop-color="#FFA200"></stop>
            </linearGradient>
          </defs>
        </svg>

        <div className="absolute left-5 top-6 flex w-[269px] items-start justify-start gap-[11px]">
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="relative h-5 w-5 flex-shrink-0 flex-grow-0"
            preserveAspectRatio="none"
          >
            <g clip-path="url(#clip0_1_4074)">
              <path
                d="M16.2167 6.66667L16.875 5.20833L18.3333 4.55C18.6583 4.4 18.6583 3.94167 18.3333 3.79167L16.875 3.13333L16.2167 1.66667C16.0667 1.34167 15.6083 1.34167 15.4583 1.66667L14.8 3.125L13.3333 3.78333C13.0083 3.93333 13.0083 4.39167 13.3333 4.54167L14.7917 5.2L15.45 6.66667C15.6 6.99167 16.0667 6.99167 16.2167 6.66667ZM9.58333 7.91667L8.25833 5C7.96667 4.35 7.03333 4.35 6.74167 5L5.41667 7.91667L2.5 9.24167C1.85 9.54167 1.85 10.4667 2.5 10.7583L5.41667 12.0833L6.74167 15C7.04167 15.65 7.96667 15.65 8.25833 15L9.58333 12.0833L12.5 10.7583C13.15 10.4583 13.15 9.53333 12.5 9.24167L9.58333 7.91667ZM15.45 13.3333L14.7917 14.7917L13.3333 15.45C13.0083 15.6 13.0083 16.0583 13.3333 16.2083L14.7917 16.8667L15.45 18.3333C15.6 18.6583 16.0583 18.6583 16.2083 18.3333L16.8667 16.875L18.3333 16.2167C18.6583 16.0667 18.6583 15.6083 18.3333 15.4583L16.875 14.8L16.2167 13.3333C16.0667 13.0083 15.6 13.0083 15.45 13.3333Z"
                fill="white"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_1_4074">
                <rect width="20" height="20" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>

          <p className="w-full flex-shrink-0 flex-grow-0 text-left text-base font-bold text-white">Fill your Form using AI</p>
          <button
            onClick={(e: any) => {
              e.preventDefault();
              e.stopPropagation();
              setShowAIPrompt(!showPrompt);
            }}
            className="absolute right-[-110px]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M11.8332 1.3415L10.6582 0.166504L5.99984 4.82484L1.3415 0.166504L0.166504 1.3415L4.82484 5.99984L0.166504 10.6582L1.3415 11.8332L5.99984 7.17484L10.6582 11.8332L11.8332 10.6582L7.17484 5.99984L11.8332 1.3415Z"
                fill="#121212"
              />
            </svg>
          </button>
        </div>

        <div className="absolute left-5  top-14 flex min-h-[233px] w-[382px] justify-start">
          <div className="flex flex-grow flex-col items-start justify-start self-stretch gap-3">
            <textarea
              placeholder="Ex: Write me a job description for a product designer"
              disabled={isLoading}
              onChange={(e) => {
                setPrompt(e.target.value);
              }}
              className={
                clsx("scrollbar-thin scrollbar-thumb-[#FF7800] scrollbar-track-[#eaeaea] relative w-full self-stretch  rounded-xl border border-[#eaeaea] bg-[#f8f8f8] px-4 pb-[221px] pt-3 text-start", {
                  "cursor-not-allowed opacity-50": isLoading
                })
              }
            />

            <div
              className="ml-auto flex h-8 min-w-[107px] flex-col items-center justify-center gap-2 rounded-[100px] border border-[#291400] bg-[#291400] px-[15px]"
              style={{
                boxShadow: "0px 2px 0px 0 rgba(5,145,255,0.1)",
              }}
            >
              <div className="relative flex h-8 flex-shrink-0 flex-grow-0 items-center justify-center gap-2">
                <button
                  disabled={isLoading}
                  onClick={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    await parseMediaFile(headers, onChange, null, item, entity, routes, prompt);
                  }}
                  className={clsx("flex-shrink-0 flex-grow-0 text-left text-sm text-white flex items-center justify-center gap-2", {
                    "cursor-not-allowed opacity-85": isLoading,
                  })}
                >
                  Fill Details
                  <div className={clsx("loader h-[15px] w-[15px] flex-shrink-0 rounded-full border-2 border-t-2 !border-t-[#FF7800] border-slate-200 text-left ease-linear", isLoading ? "" : "hidden")}></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AIPrompt;
