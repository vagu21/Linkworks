import * as React from "react"
import {
  CaretSortIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons"
import * as SelectPrimitive from "@radix-ui/react-select"

import { cn } from "~/lib/utils"

const Select = SelectPrimitive.Root

const SelectGroup = SelectPrimitive.Group

const SelectValue = SelectPrimitive.Value

const SelectTrigger = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
      className
    )}
    {...props}
  >
    {children}
    {/* <SelectPrimitive.Icon asChild>
      <CaretSortIcon className="h-4 w-4 opacity-50" />
    </SelectPrimitive.Icon> */}
    <svg width="12" height="7" viewBox="0 0 12 7" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M9.88047 0.289998L6.00047 4.17L2.12047 0.289998C1.73047 -0.100002 1.10047 -0.100002 0.710469 0.289998C0.320469 0.679998 0.320469 1.31 0.710469 1.7L5.30047 6.29C5.69047 6.68 6.32047 6.68 6.71047 6.29L11.3005 1.7C11.6905 1.31 11.6905 0.679998 11.3005 0.289998C10.9105 -0.0900024 10.2705 -0.100002 9.88047 0.289998Z" fill="#151B21" />
    </svg>

  </SelectPrimitive.Trigger>
))
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName

const SelectScrollUpButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollUpButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollUpButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollUpButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronUpIcon />
  </SelectPrimitive.ScrollUpButton>
))
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName

const SelectScrollDownButton = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.ScrollDownButton>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.ScrollDownButton>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.ScrollDownButton
    ref={ref}
    className={cn(
      "flex cursor-default items-center justify-center py-1",
      className
    )}
    {...props}
  >
    <ChevronDownIcon />
  </SelectPrimitive.ScrollDownButton>
))
SelectScrollDownButton.displayName =
  SelectPrimitive.ScrollDownButton.displayName

const SelectContent = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, children, position = "popper", ...props }, ref) => (
  <SelectPrimitive.Portal>
    <SelectPrimitive.Content
      ref={ref}
      className={cn(
        "relative z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
        position === "popper" &&
        "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
        className
      )}
      position={position}
      {...props}
    >
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport
        className={cn(
          "p-1",
          position === "popper" &&
          "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]"
        )}
      >
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>
))
SelectContent.displayName = SelectPrimitive.Content.displayName

const SelectLabel = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Label>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Label
    ref={ref}
    className={cn("px-2 py-1.5 text-sm font-semibold", className)}
    {...props}
  />
))
SelectLabel.displayName = SelectPrimitive.Label.displayName

const SelectItem = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, children, ...props }, ref) => (

  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent  data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className,
      "focus:bg-tertiary text-body font-normal leading-5 text-label",
      "group"
    )}
    {...props}
  >

    <span className="mr-2 flex h-3.5 w-3.5 items-center justify-center ">

      <SelectPrimitive.ItemIndicator>
        <svg className="" width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.99984 2.16663C5.39984 2.16663 1.6665 5.89996 1.6665 10.5C1.6665 15.1 5.39984 18.8333 9.99984 18.8333C14.5998 18.8333 18.3332 15.1 18.3332 10.5C18.3332 5.89996 14.5998 2.16663 9.99984 2.16663ZM9.99984 17.1666C6.3165 17.1666 3.33317 14.1833 3.33317 10.5C3.33317 6.81663 6.3165 3.83329 9.99984 3.83329C13.6832 3.83329 16.6665 6.81663 16.6665 10.5C16.6665 14.1833 13.6832 17.1666 9.99984 17.1666Z" fill="#FF7800" />
          <path d="M9.99984 14.6666C12.301 14.6666 14.1665 12.8011 14.1665 10.5C14.1665 8.19877 12.301 6.33329 9.99984 6.33329C7.69865 6.33329 5.83317 8.19877 5.83317 10.5C5.83317 12.8011 7.69865 14.6666 9.99984 14.6666Z" fill="#FF7800" />
        </svg>

      </SelectPrimitive.ItemIndicator>
      <span className="group-data-[state=checked]:hidden group-data-[state=unchecked]:block ">

        <svg width="20" height="21" viewBox="0 0 20 21" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.99984 2.16663C5.39984 2.16663 1.6665 5.89996 1.6665 10.5C1.6665 15.1 5.39984 18.8333 9.99984 18.8333C14.5998 18.8333 18.3332 15.1 18.3332 10.5C18.3332 5.89996 14.5998 2.16663 9.99984 2.16663ZM9.99984 17.1666C6.3165 17.1666 3.33317 14.1833 3.33317 10.5C3.33317 6.81663 6.3165 3.83329 9.99984 3.83329C13.6832 3.83329 16.6665 6.81663 16.6665 10.5C16.6665 14.1833 13.6832 17.1666 9.99984 17.1666Z" fill="#D9D9D9" />
        </svg>

      </span>
    </span>




    <SelectPrimitive.ItemText className="ml-2">{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>
))
SelectItem.displayName = SelectPrimitive.Item.displayName

const SelectSeparator = React.forwardRef<
  React.ElementRef<typeof SelectPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-muted", className)}
    {...props}
  />
))
SelectSeparator.displayName = SelectPrimitive.Separator.displayName

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
  SelectScrollUpButton,
  SelectScrollDownButton,
}
