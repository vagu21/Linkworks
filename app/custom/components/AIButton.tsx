import React, { useState } from "react";
import { ChevronUp } from 'lucide-react';
import { useProcessMediaFile } from "~/modules/mediaParser/useProcessMedia";
import FloatingLoader from "~/components/ui/loaders/FloatingLoader";

const AIButton = ({ headers, onChange, item, routes, entity }: any) => {
    const [isOpen, setIsOpen] = useState(false);
    const [prompt, setPrompt] = React.useState("");
    const addDynamicRow = () => { };
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
                className={`bg-AI-gradient px-4 rounded-[12px] w-full ${isOpen ? 'pb-4 ' : ''}`}>
                <div className="flex items-center justify-between w-full py-4 ">
                    <div className="flex items-center">
                        <div className="flex gap-[11px] items-center ">
                            <div className=""><svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clip-path="url(#clip0_1_153)">
                                    <path d="M16.2167 6.66667L16.875 5.20833L18.3333 4.55C18.6583 4.4 18.6583 3.94167 18.3333 3.79167L16.875 3.13333L16.2167 1.66667C16.0667 1.34167 15.6083 1.34167 15.4583 1.66667L14.8 3.125L13.3333 3.78333C13.0083 3.93333 13.0083 4.39167 13.3333 4.54167L14.7917 5.2L15.45 6.66667C15.6 6.99167 16.0667 6.99167 16.2167 6.66667ZM9.58333 7.91667L8.25833 5C7.96667 4.35 7.03333 4.35 6.74167 5L5.41667 7.91667L2.5 9.24167C1.85 9.54167 1.85 10.4667 2.5 10.7583L5.41667 12.0833L6.74167 15C7.04167 15.65 7.96667 15.65 8.25833 15L9.58333 12.0833L12.5 10.7583C13.15 10.4583 13.15 9.53333 12.5 9.24167L9.58333 7.91667ZM15.45 13.3333L14.7917 14.7917L13.3333 15.45C13.0083 15.6 13.0083 16.0583 13.3333 16.2083L14.7917 16.8667L15.45 18.3333C15.6 18.6583 16.0583 18.6583 16.2083 18.3333L16.8667 16.875L18.3333 16.2167C18.6583 16.0667 18.6583 15.6083 18.3333 15.4583L16.875 14.8L16.2167 13.3333C16.0667 13.0083 15.6 13.0083 15.45 13.3333Z" fill="white" />
                                </g>
                                <defs>
                                    <clipPath id="clip0_1_153">
                                        <rect width="20" height="20" fill="white" />
                                    </clipPath>
                                </defs>
                            </svg>
                            </div>
                            <p className="text-white text-[16px] leading-[19px] font-bold">Magic Fill your Form</p>
                        </div>
                    </div>

                    <div className="flex items-center">

                        {isOpen && (<button
                            style={{
                                background: 'linear-gradient(90deg, #291400 0%, #8F4600 100%)',
                            }}
                            onClick={async (e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                await parseMediaFile(headers, onChange, null, item, entity, routes, prompt);
                            }}
                            className=" text-white px-[15px] py-1 rounded-[100px] flex items-center mr-2 text-sm "
                        >
                            <div className="flex gap-x-2 items-center px-[15px] ">
                                <div className="py-[6px] ">
                                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <g clip-path="url(#clip0_1977_24740)">
                                            <path d="M17.0416 4.99994L17.45 4.1166L18.3333 3.70827C18.6583 3.55827 18.6583 3.09993 18.3333 2.94993L17.45 2.5416L17.0416 1.6666C16.8916 1.3416 16.4333 1.3416 16.2833 1.6666L15.875 2.54993L15 2.95827C14.675 3.10827 14.675 3.5666 15 3.7166L15.8833 4.12493L16.2916 4.99994C16.4333 5.32494 16.9 5.32494 17.0416 4.99994Z" fill="#E8EAED" />
                                            <path d="M7.45827 4.99994L7.8666 4.1166L8.74994 3.70827C9.07494 3.55827 9.07494 3.09993 8.74994 2.94993L7.8666 2.54993L7.45827 1.6666C7.3166 1.3416 6.84994 1.3416 6.70827 1.6666L6.29993 2.54993L5.4166 2.95827C5.0916 3.10827 5.0916 3.5666 5.4166 3.7166L6.29993 4.12493L6.70827 4.99994C6.84994 5.32494 7.3166 5.32494 7.45827 4.99994Z" fill="#E8EAED" />
                                            <path d="M16.2915 11.2497L15.8832 12.133L14.9999 12.5414C14.6749 12.6914 14.6749 13.1497 14.9999 13.2997L15.8832 13.708L16.2915 14.5914C16.4415 14.9164 16.8999 14.9164 17.0499 14.5914L17.4582 13.708L18.3332 13.2914C18.6582 13.1414 18.6582 12.683 18.3332 12.533L17.4499 12.1247L17.0415 11.2414C16.8999 10.9247 16.4332 10.9247 16.2915 11.2497Z" fill="#E8EAED" />
                                            <path d="M14.7583 7.60013L12.4 5.2418C12.075 4.9168 11.55 4.9168 11.225 5.2418L1.9083 14.5501C1.5833 14.8751 1.5833 15.4001 1.9083 15.7251L4.26663 18.0835C4.59163 18.4085 5.11663 18.4085 5.44163 18.0835L14.75 8.77513C15.0833 8.45846 15.0833 7.92513 14.7583 7.60013ZM11.8416 9.3418L10.6666 8.1668L11.8166 7.0168L12.9916 8.1918L11.8416 9.3418Z" fill="#E8EAED" />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_1977_24740">
                                                <rect width="20" height="20" fill="white" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                </div>
                                <div className="text-[14px] leading-[22px] font-normal text-white">Magic Fill</div>
                            </div>
                        </button>)}


                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-white"
                        >
                            <ChevronUp
                                className={`h-6 w-6 transition-transform duration-200 ${!isOpen ? 'transform rotate-180' : ''}`}
                            />
                        </button>
                    </div>
                </div>

                {isOpen && (
                    <div className="bg-white rounded-[12px] h-[95px] ">
                        <textarea
                            onChange={(e) => setPrompt(e.target.value)}
                            className="w-full border-none outline-none resize-none h-[95px] rounded-[12px] "
                            placeholder="Ex: Write me a JD for a product designer"
                            value={prompt}
                        />
                    </div>
                )}
            </div>
        </>
    )
}

export default AIButton