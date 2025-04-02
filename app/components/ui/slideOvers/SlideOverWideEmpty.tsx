import { Fragment, ReactNode, useEffect, useState } from "react";
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from "@headlessui/react";
import XIcon from "../icons/XIcon";
import clsx from "clsx";

export default function SlideOverWideEmpty({
  title,
  description,
  open,
  children,
  onClose,
  className,
  buttons,
  withTitle = true,
  withClose = true,
  overflowYScroll,
  position = 5,
  size = "2xl",
}: {
  title?: string | ReactNode;
  description?: string;
  open: boolean;
  children: ReactNode;
  onClose: () => void;
  className?: string;
  buttons?: ReactNode;
  withTitle?: boolean;
  withClose?: boolean;
  overflowYScroll?: boolean;
  position?: 0 | 1 | 2 | 3 | 4 | 5 | 99;
  size?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
}) {
  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 z-50 bg-gray-500 bg-opacity-75 transition-opacity" />
        </TransitionChild>

        <div
          className={clsx(
            "fixed inset-0 overflow-hidden ",
            position === 0 && "z-0",
            position === 1 && "z-10",
            position === 2 && "z-20",
            position === 3 && "z-30",
            position === 4 && "z-40",
            position === 5 && "z-50"
          )}
        >
          <div className="absolute inset-0 overflow-hidden bg-[rgba( 0, 0, 0, 0.45 )] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] backdrop-blur-[6.5px] rounded-tl-lg rounded-bl-lg border-[1px_solid_rgba(255,255,255,0.18)]">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full sm:pl-16">
              <TransitionChild
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-300"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-300"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <DialogPanel
                  className={clsx(
                    "border-border pointer-events-auto w-screen overflow-auto border rounded-tl-lg rounded-bl-lg shadow-lg",
                    className,
                    size === "sm" && "max-w-sm",
                    size === "md" && "max-w-md",
                    size === "lg" && "max-w-lg",
                    size === "xl" && "max-w-xl",
                    size === "2xl" && "max-w-2xl",
                    size === "3xl" && "max-w-3xl",
                    size === "4xl" && "max-w-4xl",
                    size === "5xl" && "max-w-5xl",
                    size === "6xl" && "max-w-6xl",
                    size === "7xl" && "max-w-7xl",
                    size === "full" && "max-w-full"
                  )}
                >
                  <div className="bg-background flex h-full flex-col overflow-y-auto pt-4 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between sticky top-0 bg-white z-10">
                        {withTitle ? (
                          <div className="flex flex-col w-full py-2 sticky">
                            <div className="flex items-center justify-between">
                              <DialogTitle className="text-md text-black">{title}</DialogTitle>       
                                <button
                                  type="button"
                                  className="text-muted-foreground hover:text-foreground focus:ring-ring rounded-md outline-none focus:outline-none focus:ring-2 focus:ring-offset-2"
                                  onClick={onClose}
                                >
                                  <span className="sr-only">Close panel</span>
                                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M19 6.41L17.59 5L12 10.59L6.41 5L5 6.41L10.59 12L5 17.59L6.41 19L12 13.41L17.59 19L19 17.59L13.41 12L19 6.41Z" fill="#151B21" />
                                  </svg>
                                </button>
                              
                            </div>
                          </div>
                        ) : (
                          <></>
                        )}
                      </div>
                    </div>

                    <div className={clsx("min-h-full relative mt-3 flex-1 border-t px-4 pb-6 pt-5 sm:px-6", overflowYScroll && "overflow-y-scroll")}>{children}</div>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
