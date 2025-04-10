import clsx from "clsx";
import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ColumnDto } from "~/application/dtos/data/ColumnDto";
import { RowHeaderDisplayDto } from "~/application/dtos/data/RowHeaderDisplayDto";
import ButtonSecondary from "~/components/ui/buttons/ButtonSecondary";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import RowDisplayHeaderHelper from "~/utils/helpers/RowDisplayHeaderHelper";
import RowDisplayValueHelper from "~/utils/helpers/RowDisplayValueHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import StringUtils from "~/utils/shared/StringUtils";
interface Props {
  entity: EntityWithDetails;
  item: RowWithDetails;
  layout: string;
  columns?: ColumnDto[];
  allEntities: EntityWithDetails[];
  routes?: EntitiesApi.Routes;
  href?: string;
  onRemove?: any;
  actions?: (row: RowWithDetails) => {
    title?: string;
    href?: string;
    onClick?: () => void;
    isLoading?: boolean;
    render?: React.ReactNode;
  }[];
}
export default function RelationCard({ entity, item, columns, layout, allEntities, routes, actions, href, onRemove }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<RowWithDetails>[]>([]);
  const [expandedCards, setExpandedCards] = useState<{ [key: string]: boolean }>({});
  const toggleExpanded = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const [expandedText, setExpandedText] = useState(false);

  const transformHeader = (
    property: PropertyWithDetails
  ): { id: string; name: string; type: number; subType: string | null; label: string; value: any; attributes: any } => {
    const attributes = property?.attributes;
    return {
      id: property.id,
      subType: property.subtype,
      type: property.type || 0,
      name: property.name,
      label: StringUtils.capitalize(property.title || property.name),
      value: item.values.find((o) => o.propertyId === property.id),
      attributes: attributes,
    };
  };

  const getRichTextLength = (value: any): number => {
    if (typeof value === "string") {
      return value.length;
    }
    return 0;
  };
  

  const rowCount = headers.length;
  useEffect(() => {
    setHeaders(RowDisplayHeaderHelper.getDisplayedHeaders({ entity, columns, layout, allEntities: allEntities, t, routes }));
  }, [entity, columns, layout, allEntities, t, routes]);

  return (
    <div className="flex w-full flex-row justify-between gap-2 pr-6">
      <div className="flex-1">
        <div className={clsx("grid grid-cols-4 gap-5 max-md:grid-cols-2 max-md:gap-3 transition-all duration-300", rowCount > 1 && !expandedCards[item.id] ? "overflow-hidden max-h-[55px] min-h-[55px]" : "")}>
          {headers.map((header, idx) => {
            const propertyId = (item?.values ?? [])?.find((v: any) => v.textValue === header.value(item, idx))?.propertyId;
            const property = entity?.properties?.find((p: any) => p.id === propertyId && !p.isHidden);
            let isRichTextEditor = false;
            let isRichText = false;
            let dynamicRelationClass = "col-span-1";

            if (property) {
              const { type, attributes } = transformHeader(property);
              const isFieldRelationTextEditor = attributes?.some((attribute: any) =>
                ["EditorSize", "editor", "EditorLanguage"].includes(attribute.name)
              ) || false;
              isRichTextEditor = isFieldRelationTextEditor;
              isRichText = type === PropertyType.MEDIA || isRichTextEditor;
              dynamicRelationClass = clsx(isRichText ? "col-span-full" : "col-span-1");
            }



            return (
              <div key={idx} className={clsx("flex flex-col gap-1", header.className, "pr-3", dynamicRelationClass)}>
                <div className=" text-[10px] font-normal leading-[14px] text-[#737373]">{t(header.title)}</div>
                <div className="flex flex-col">

                  <div className="text-small max-w-full font-medium text-[#121212]">

                  <div title={RowDisplayValueHelper.getRowValue(t, header, item, idx)}  className={clsx(!isRichText ? "max-w-[160px] min-w-[180px] truncate" : "", !expandedText && "line-clamp-2")}>
                      <div>
                        {RowDisplayValueHelper.displayRowValue(t, header, item, idx)}
                      </div>
                    </div>


                  </div>
                  <div>
                    {isRichTextEditor && getRichTextLength(header.value(item, idx)) > 150 && (
                      <div>
                        <button
                          className="text-xs font-bold underline cursor-pointer text-[#FF7800] whitespace-nowrap"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            setExpandedText((prev) => !prev);
                          }}
                        >
                          {expandedText ? t("shared.readLess") : t("shared.readMore")}

                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

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
      </div>



      {(rowCount > 4 || headers.some((header, idx) => {
        const propertyId = (item?.values ?? [])?.find((v: any) => v.textValue === header.value(item, idx))?.propertyId;
        const property = entity?.properties?.find((p: any) => p.id === propertyId && !p.isHidden);
        return property && (property.type === PropertyType.MEDIA || property.attributes?.some((attr: any) =>
          ["EditorSize", "editor", "EditorLanguage"].includes(attr.name)
        ));
      })) && (
          <div className="mt-[10px] mr-4 flex whitespace-nowrap">

            <div className="flex items-start">
              <button
                className="text-xs font-semibold underline cursor-pointer text-[#121212] hover:text-[#737373]"
                onClick={(e) => toggleExpanded(e, item.id)}
              >
                {expandedCards[item.id] ? t("shared.knowLess") : t("shared.knowMore")}
              </button>
            </div>
          </div>
        )}

    </div>
  );
}
