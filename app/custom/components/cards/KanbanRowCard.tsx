import clsx from "clsx";
import { Fragment, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";
import { formatDistanceToNow } from 'date-fns';
import {useParams, useSubmit } from "@remix-run/react";

interface Props {
  entity: EntityWithDetails;
  item: RowWithDetails;
  layout: string;
  columns?: ColumnDto[];
  allEntities: EntityWithDetails[];
  routes?: EntitiesApi.Routes;
  actions?: (row: RowWithDetails) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
}

const Popover: React.FC<{
  closePopover: () => void;
  actions?: any[];
  statusValues?: string[];
  onSelectStatus?: (status: string, itemId: string, tenantSlug: string) => void;
  selectedStatus?: string;
  itemId: string;  
  tenantSlug: string;
}> = ({ closePopover, actions, statusValues, onSelectStatus, selectedStatus, itemId, tenantSlug }) => {
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        closePopover(); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [closePopover]);

  return (
    <section
      ref={popoverRef}
      className="absolute z-20 w-[200px] bg-[#FFF] border border-[#E6E6E6] shadow-[0px_12px_24px_-4px_rgba(145,158,171,0.12),0px_0.726px_1.452px_0px_rgba(16,24,40,0.05)] rounded-md mt-20 right-0 top-7"
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          closePopover();
        }}
        className="self-end text-xs text-gray-600 p-2"
      >
        Close
      </button>
      <div className="px-2 py-1">
        <div className="mt-2">
          <ul>
            {statusValues?.map((status, index) => (
              <li
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onSelectStatus?.(status, itemId, tenantSlug);
                }}
                className={`p-2 cursor-pointer text-sm  text-[#101828] ${status === selectedStatus ? 'bg-[#FFEFC9]' : 'hover:bg-[#FFEFC9]'} transition-colors`}
              >
                {status}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default function KanbanRowCard({ entity, item, columns, layout, allEntities, routes, actions }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  const params = useParams();
  const entityName = params.entity;
  const groupName = params.group;
  const tenantName = params.tenant;
  const tenantSlug = params.tenant;
  const submit = useSubmit();


  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders({ entity, columns, layout, allEntities: allEntities, t, routes }));
  }, [entity, columns, layout, allEntities, t, routes]);

  const visibleHeaders = isExpanded ? headers : headers.slice(0, 2);
  const hasMoreItems = headers.length > 2;
  const createdAtAgo = formatDistanceToNow(new Date(entity.createdAt), { addSuffix: true, includeSeconds: true });

  const createdAtUpdated = createdAtAgo.replace(/^about /, '');
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);


  const statusProperty = entity.properties.find((property: any) => property.name === 'status');
  const statusValues = statusProperty ? statusProperty.options.map((option: any) => option.value) : [];
  const togglePopover = () => {
    setIsPopoverOpen(!isPopoverOpen);
  };

 
  const handleStatusSelect = (status: string, itemId: string) => {
    const form = new FormData();
    form.set("action", "edit");
    form.set("status", status);
  
    submit(form, {
      navigate : false,
      method: "post",
      action: `/app/${tenantName}/g/${groupName}/${entityName}/${itemId}/edit`,
    });
  };

 
  return (
    <div className="flex flex-col gap-3 whitespace-nowrap">
      <header className="flex flex-row gap-10 justify-between items-center w-full ">
        {entity.icon ? (
          <div className="flex overflow-hidden flex-col justify-center items-center bg-white rounded-sm border-solid border-[0.726px] border-[#F2F4F7] h-[26px] w-[26px] p-2">
            <div
              className="flex justify-center items-center"
              dangerouslySetInnerHTML={{ __html: entity.icon }}
            />
          </div>
        ) : (
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/f6773c86571fcc8d18077bc3b251eda36cf39124b1ee0db2d230c1a1795c6a48?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839"
            className="object-contain shrink-0 self-stretch my-auto aspect-square w-[26px]"
            alt="Profile icon"
          />
        )}

        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            togglePopover();
          }}
          className="p-0 m-0 bg-transparent"
        >
          <img
            loading="lazy"
            src="https://cdn.builder.io/api/v1/image/assets/TEMP/87e76f9daa55697918b2b9125cca76867d8be327072c219068b545768fb03912?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839"
            className="object-contain shrink-0 self-stretch my-auto aspect-square h-[18px] w-[18px]"
            alt="Menu icon"
          />
        </button>

        {isPopoverOpen && (
          <Popover
            closePopover={togglePopover}
            statusValues={statusValues}
            onSelectStatus={handleStatusSelect}
            itemId={item.id}
            tenantSlug={tenantSlug ?? ""}
          />
        )}



      </header>

      <div className="border-b border-[#F3F3F3]"></div>
      {/* {headers.map((header, idx) => { */}

      {visibleHeaders.map((header, idx) => {

        return (

          <div
            key={idx}
            className={clsx(
              "flex justify-between items-center py-2 border-b border-[#F3F3F3] last:border-0",
              header.className
            )}
          >

            <div> <p className=" text-xs text-[#667085] font-normal"> {t(header.title)}</p>   </div>
            <div > <p className="w-full text-xs font-medium text-[#101828] truncate hover:overflow-visible hover:bg-white hover:z-10">{RowDisplayValueHelper.displayRowValue(t, header, item, idx)}</p></div>
          </div>

        );
      })}

      {hasMoreItems && (
        <div className="flex flex-row justify-between items-center">
          <div className="">
            <p className="text-xs text-[#667085] font-normal">{createdAtUpdated}</p>
          </div>
          <div>
            <button
              onClick={(e: any) => {
                e.stopPropagation();
                e.preventDefault();
                setIsExpanded(!isExpanded);
              }}
              className="w-full flex items-center justify-center gap-1 text-xs font-normal text-[#FF7800]  transition-colors underline"
            >
              {isExpanded ? (
                <>
                  View less
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                    <g clip-path="url(#clip0_1007_26979)">
                      <path d="M12.4841 6.73949L9.66682 9.55681L6.84949 6.73949C6.56631 6.4563 6.10885 6.4563 5.82567 6.73949C5.54249 7.02267 5.54249 7.48012 5.82567 7.76331L9.15854 11.0962C9.44172 11.3794 9.89917 11.3794 10.1824 11.0962L13.5152 7.76331C13.7984 7.48012 13.7984 7.02267 13.5152 6.73949C13.232 6.46356 12.7673 6.4563 12.4841 6.73949Z" fill="#FF7800" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1007_26979">
                        <rect width="17.4268" height="17.4268" fill="white" transform="translate(0.953125 -0.00610352)" />
                      </clipPath>
                    </defs>
                  </svg>

                </>
              ) : (
                <>
                  View more
                  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="18" viewBox="0 0 19 18" fill="none">
                    <g clip-path="url(#clip0_1007_26979)">
                      <path d="M12.4841 6.73949L9.66682 9.55681L6.84949 6.73949C6.56631 6.4563 6.10885 6.4563 5.82567 6.73949C5.54249 7.02267 5.54249 7.48012 5.82567 7.76331L9.15854 11.0962C9.44172 11.3794 9.89917 11.3794 10.1824 11.0962L13.5152 7.76331C13.7984 7.48012 13.7984 7.02267 13.5152 6.73949C13.232 6.46356 12.7673 6.4563 12.4841 6.73949Z" fill="#FF7800" />
                    </g>
                    <defs>
                      <clipPath id="clip0_1007_26979">
                        <rect width="17.4268" height="17.4268" fill="white" transform="translate(0.953125 -0.00610352)" />
                      </clipPath>
                    </defs>
                  </svg>


                </>
              )}
            </button>
          </div>

        </div>
      )}

      {actions && (
        <div className="flex flex-col space-y-2">
          {actions(item).map((action, idx) => {
            return (
              <Fragment key={idx}>
                {action.render ?? (
                  <ButtonSecondary
                    className="w-full"
                    to={action.href}
                    isLoading={action.isLoading}
                    onClick={(e) => {
                      if (action.onClick) {
                        e.stopPropagation();
                        e.preventDefault();
                        action.onClick();
                      }
                    }}
                  >
                    <div className="flex w-full justify-center">{action.title}</div>
                  </ButtonSecondary>
                )}
              </Fragment>
            );
          })}
        </div>
      )}
    </div>
  );
}
