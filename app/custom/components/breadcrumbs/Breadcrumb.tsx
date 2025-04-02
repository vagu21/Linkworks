import clsx from "clsx";
import { Link } from "@remix-run/react";
import { Fragment, useMemo } from "react";

interface BreadCrumbItem {
  icon?: JSX.Element | string; 
  link: string;
  label: string;
}

const BreadCrumItem = ({
  idx,
  item,
  isLast = false,
  className = "",
}: {
  idx: number;
  className?: string;
  item: BreadCrumbItem;
  isLast?: boolean;
}) => {
  return (
    <div className="flex items-center space-x-1">
      {isLast ? (
        <>
          {item.icon && typeof item.icon === "string" ? (
            <img
              loading="lazy"
              src={item.icon}
              className="mr-2 object-contain shrink-0"
              alt={item.label}
            />
          ) : (
            <span className="text-xl">{item.icon}</span>
          )}
          <span className="text-sm font-semibold text-[#0B0A09] hover:cursor-default">
            {item.label}
          </span>
        </>
      ) : (
        <>
          {item.icon && typeof item.icon === "string" ? (
            <img
              loading="lazy"
              src={item.icon}
              className="mr-2 object-contain shrink-0"
              alt={item.label}
            />
          ) : (
            <span className="text-xl">{item.icon}</span>
          )}
          <Link
            to={item.link}
            className="text-xs font-normal text-[#4D4D4D] hover:underline hover:text-opacity-80"
          >
            {item.label}
          </Link>
          <span className="px-1 text-xs text-[#4D4D4D]"> / </span>
        </>
      )}
    </div>
  );
};

interface MenuItem {
  title: string;
  routePath?: string;
  icon?: JSX.Element | string; 
}

interface Props {
  menu: MenuItem[];
  className?: string;
  home?: string;
}

export default function BreadcrumbCustom({
  menu = [],
  className = "",
  home = "",
}: Props) {
  const items = useMemo(
    () => [
      ...(home
        ? [
            {
              label: "Home",
              link: home.length ? home : "/",
              icon: undefined,
            },
          ]
        : []),
      ...menu
        .filter((o) => o.title)
        .map((o) => ({ label: o.title, link: o.routePath || "/", icon: o.icon })),
    ],
    [home, menu]
  )

  return (
    <nav className={clsx("not-prose flex truncate", className)} aria-label="Breadcrumb">
      <ol className="flex flex-row flex-wrap items-center">
        {items.map((item, index: number) => (
          <li key={item.label}>
            {/* {(index > 0 || home) && <RightIcon className="h-4 w-4 flex-shrink-0 text-gray-400" />} */}
            <BreadCrumItem
              idx={index}
              item={item}
              isLast={!(index < items.length - 1)}
            />
          </li>
        ))}
      </ol>
    </nav>
  )
}
