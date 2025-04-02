import * as React from "react";

import { cn } from "~/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref: any) => {
  const [isInvalid, setIsInvalid] = React.useState(false);
  return (
    <div className="relative w-full">
      <input
        type={type}
        className={cn(
          "focus-visible:border-ring focus-visible:border-[#0A0501]  placeholder:text-muted-foreground focus-visible:ring-ring flex h-9 w-full rounded-md bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50",
          className, "!border-[#D9D9D9]", `${isInvalid ? "!border-error  !focus-visible:border-error !focus-visible:ring-error " : ""} [&::-webkit-calendar-picker-indicator]:opacity-0 border-top-disabled`
        )}
        onInvalid={() => setIsInvalid(true)}
        onInput={() => setIsInvalid(false)}
        onClick={() => ref.current.showPicker()}
        ref={ref}
        {...props}
      />
      {type == 'date' && !isInvalid &&
        <div onClick={() => { ref.current.showPicker() }} className="absolute right-2  top-1/2 -translate-y-1/2 ">
          <svg width="18" height="20" viewBox="0 0 18 20" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 9H6V11H4V9ZM18 4V18C18 19.1 17.1 20 16 20H2C0.89 20 0 19.1 0 18L0.00999999 4C0.00999999 2.9 0.89 2 2 2H3V0H5V2H13V0H15V2H16C17.1 2 18 2.9 18 4ZM2 6H16V4H2V6ZM16 18V8H2V18H16ZM12 11H14V9H12V11ZM8 11H10V9H8V11Z" fill="#151B21" />
          </svg>

        </div>
      }

      {isInvalid &&
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2"
          width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1C4.13438 1 1 4.13438 1 8C1 11.8656 4.13438 15 8 15C11.8656 15 15 11.8656 15 8C15 4.13438 11.8656 1 8 1ZM10.5844 10.6594L9.55313 10.6547L8 8.80313L6.44844 10.6531L5.41563 10.6578C5.34688 10.6578 5.29063 10.6031 5.29063 10.5328C5.29063 10.5031 5.30156 10.475 5.32031 10.4516L7.35313 8.02969L5.32031 5.60938C5.30143 5.58647 5.29096 5.5578 5.29063 5.52812C5.29063 5.45937 5.34688 5.40312 5.41563 5.40312L6.44844 5.40781L8 7.25938L9.55156 5.40938L10.5828 5.40469C10.6516 5.40469 10.7078 5.45937 10.7078 5.52969C10.7078 5.55937 10.6969 5.5875 10.6781 5.61094L8.64844 8.03125L10.6797 10.4531C10.6984 10.4766 10.7094 10.5047 10.7094 10.5344C10.7094 10.6031 10.6531 10.6594 10.5844 10.6594Z" fill="#FF4D4F" />
        </svg>
      }
    </div>
  );
});
Input.displayName = "Input";

export { Input };
