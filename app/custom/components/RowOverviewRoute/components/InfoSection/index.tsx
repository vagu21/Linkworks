import clsx from 'clsx';
import React, { HTMLProps } from 'react';

interface InfoSectionProps {
  label: string;
  value: string | JSX.Element;
  labelClassName?: HTMLProps<HTMLElement>["className"];
  valueClassName?: HTMLProps<HTMLElement>["className"];
}



const InfoSection: React.FC<InfoSectionProps> = ({ label, value,valueClassName,labelClassName }) => {
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
      <div className={clsx("flex-1 shrink gap-2.5 self-stretch mt-1 text-neutral-800", valueClassName)}>
        {value}
      </div>
    </div>
  );
};

export default InfoSection;
