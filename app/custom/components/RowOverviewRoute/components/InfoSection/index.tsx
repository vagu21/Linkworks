import clsx from 'clsx';
import React, { HTMLProps } from 'react';

interface InfoSectionProps {
  label: string;
  value: string | JSX.Element;
  labelClassName?: HTMLProps<HTMLElement>["className"];
  valueClassName?: HTMLProps<HTMLElement>["className"];
}



const InfoSection: React.FC<InfoSectionProps> = ({ label, value,valueClassName,labelClassName }) => {
  let title: string | undefined = undefined;
  if (typeof value === "string") {
    title = value; 
    
  }
  else if (value && value.props && value.props.children && typeof value.props.children === "string") {
    title = value?.props?.children;
  }
  return (
    <div className="w-full">
      <div
        className={clsx(
          "gap-2.5 self-stretch w-full text-neutral-500 capitalize",
          labelClassName
        )}
      >
        {label}
      </div>
      <div title= {title} className={clsx("flex-1 shrink gap-2.5 self-stretch mt-1 text-neutral-800", valueClassName)}>
        {value}
      </div>
    </div>
  );
};

export default InfoSection;
