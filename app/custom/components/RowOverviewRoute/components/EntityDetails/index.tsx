import { ReactNode, useEffect, useState } from "react";
import TabNavigation from "../TabNavigation";
import KeywordTags from "../KeywordTags";
import InfoSection from "../InfoSection";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowValueWithDetails, RowWithDetails, RowWithValues } from "~/utils/db/entities/rows.db.server";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import { LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import StringUtils from "~/utils/shared/StringUtils";
import DateUtils from "~/utils/shared/DateUtils";
import MediaItem from "~/components/ui/uploaders/MediaItem";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";
import clsx from "clsx";
import RatingBadge from "~/components/ui/badges/RatingBadge";
import { MediaDto } from "~/application/dtos/entities/MediaDto";
import PreviewMediaModal from "~/components/ui/media/PreviewMediaModal";
import ThatAllIcon from "~/components/ui/icons/thatallsvg/ThatAllIcon";
import { useTranslation } from "react-i18next";

const EntityDetails = ({
  entity,
  routes,
  item,
  editing,
  linkedAccounts,
  canDelete,
  canUpdate,
  allEntities,
  onSubmit,
  relationshipRows,
  promptFlows,
  children,
}: {
  entity: EntityWithDetails;
  routes: EntitiesApi.Routes;
  item: RowWithDetails;
  editing: boolean;
  linkedAccounts: LinkedAccountWithDetailsAndMembers[];
  canDelete: boolean;
  canUpdate: boolean;
  allEntities: any;
  relationshipRows: RowsApi.GetRelationshipRowsData;
  promptFlows: any;
  onSubmit: (data: FormData) => void;
  children?: ReactNode;
}) => {
  const [activeTab, setActiveTab] = useState("Details");
  const [currentEntity, setCurrentEntity] = useState<EntityWithDetails>(entity);
  const [tabs, setTabs] = useState([]);
  const [groups, setGroups] = useState<{ group?: string; headers: PropertyWithDetails[] }[]>([]);
  const [selectedItem, setSelectedItem] = useState<MediaDto>();
  const [expandedText, setExpandedText] = useState<{ [key: string]: boolean }>({});

  const toggleTextExpansion = (groupId: string) => {
    setExpandedText((prev) => ({
      ...prev,
      [groupId]: !prev[groupId],
    }));
  };

   const { t } = useTranslation();

  function renderRelationshipTab(tabName: string) {
    const parentRelationship = entity.parentEntities.find((r) => r.parent.name === tabName);
    const childRelationship = entity.childEntities.find((r) => r.child.name === tabName);
    const relationship = parentRelationship || childRelationship;

    if (!relationship) return null;

    let relatedRowsData = relatedRows.find((r) => r.relationship.id === relationship.id);

    if (!relatedRowsData?.rows.length) {
      return <div className="mt-10 flex w-full items-center justify-center p-4 text-center text-gray-500">No {tabName} records found.</div>;
    }

    const systemView: any = currentEntity.views.find((f) => f.isSystem);
    const systemViewProperties = systemView?.properties;
    if (systemView) {
      currentEntity.properties?.forEach((property) => {
        const systemViewProperty = systemViewProperties?.find((f: any) => f.propertyId === property.id);
        if (systemViewProperty) {
          property.isHidden = false;
        } else {
          property.isHidden = true;
        }
      });
    }

    const getTextLength = ({
      type,
      rowValue,
    }: {
      type: number;
      rowValue: RowValueWithDetails;
    }): number => {
      if (type === PropertyType.TEXT) {
        return rowValue?.textValue?.length || 0;
      }
      return 0;
    };
    

    

    return groups.map((g, gIndex) => (
      <>
        {g.group ? (
          <section key={g.group} className="mt-4 w-full self-center px-4 text-sm max-md:max-w-full">
            <h2 className="self-start text-base font-semibold text-stone-950">{g.group}</h2>
          </section>
        ) : null}
        <div className="px-[14px] py-[24px]">
          <div className="flex flex-col gap-6">
            <div>
              <span className="text-sm font-semibold text-stone-950">{tabName}</span>
            </div>
            {relatedRowsData.rows.map((row) => (
              <div
                key={row.id}
                className="rounded-lg border border-solid border-neutral-200 bg-neutral-50 p-3 text-sm  shadow-[0px_1px_1px_rgba(16,24,40,0.05)]"
              >
                <div className="grid grid-cols-4 gap-4 max-md:grid-cols-1">
                  {row.values?.map((value) => {
                    const property = currentEntity?.properties?.find((p: any) => p.id === value.propertyId && !p.isHidden);
                    if (!property) return null;

                    const { type, subType, attributes } = transformHeader(property);
                    const label = property?.title;
                    const isFieldRelationTextEditor =
                      attributes?.some((attribute: any) => ["EditorSize", "editor", "EditorLanguage"].includes(attribute.name)) || false;
                    const isRichText = type === PropertyType.MEDIA || isFieldRelationTextEditor;
                    const dynamicRelationClass = clsx(isRichText ? "col-span-full" : "col-span-1");
                    if (!["ID", "Models.row.folio", "Created at", "Created by"].includes(label)) {
                      return (
                        <div key={value.id} className={dynamicRelationClass}>
                          <InfoSection
                            key={value.id}
                            valueClassName={clsx(!isRichText ? "overflow-hidden text-ellipsis max-w-[230px] whitespace-nowrap" : "")}
                            label={label}
                            value={
                              <div
                                className={clsx(
                                  !expandedText[value.id] && "line-clamp-2",
                                  !isRichText && "truncate max-w-[160px] min-w-[180px] inline-block"
                                )}
                              >
                                {getValueByType({ type, subType, rowValue: value, attributes })}
                              </div>
                            }
                          />
                          {isFieldRelationTextEditor && getTextLength({ type, rowValue: value }) > 150 && (
                            <button
                              className="text-xs font-bold underline cursor-pointer text-[#FF7800] whitespace-nowrap mt-1"
                              onClick={() => toggleTextExpansion(value.id)}
                            >
                              {/* {expandedText[value.id] ? "Read less" : "Read more"} */}
                              {expandedText[value.id] ? t("shared.readLess") : t("shared.readMore")}

                            </button>
                          )}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                {/* </section> */}
              </div>
            ))}
          </div>
        </div>

        {gIndex < groups.length - 1 ? <hr className="mt-4 h-px w-full shrink-0 border border-solid border-zinc-100" /> : null}
      </>
    ));
  }

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

  useEffect(() => {
    const groups: { group?: string; headers: PropertyWithDetails[] }[] = [];
    let entityselected = activeTab == "Details" ? entity : allEntities.find((f: any) => f.name === activeTab);
    setCurrentEntity(entityselected);
    entityselected?.properties.forEach((header: any) => {
      const groupName = PropertyAttributeHelper.getPropertyAttributeValue_String(header, PropertyAttributeName.Group);
      let found = groups.find((f) => f.group === groupName);
      if (!found) {
        found = groups.find((f) => !f.group && !groupName);
      }
      if (found) {
        found.headers.push(header);
      } else {
        groups.push({
          group: groupName,
          headers: [header],
        });
      }
    });
    if (groups.length === 0) {
      groups.push({ group: "Details", headers: entity?.properties });
    }
    setGroups(groups);
  }, [entity, item, activeTab]);

  const [relatedRows, setRelatedRows] = useState<{ relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[]>([]);

  useEffect(() => {
    const initialRelatedRows: { relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[] = [];

    if (item) {
      entity.parentEntities.forEach((relationship) => {
        if (item.parentRows?.length > 0) {
          initialRelatedRows.push({
            relationship,
            rows: item.parentRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.parent),
          });
        }
      });

      entity.childEntities.forEach((relationship) => {
        if (item.childRows?.length > 0) {
          initialRelatedRows.push({
            relationship,
            rows: item.childRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.child),
          });
        }
      });
    }

    setRelatedRows(initialRelatedRows);
  }, [entity, item]);

  useEffect(() => {
    let relations: any = [];

    for (let i = 0; i < entity?.parentEntities.length; i++) {
      relations.push(entity?.parentEntities[i].parent.name);
    }

    // Filter childEntities based on readOnly
    entity?.childEntities.forEach((relationship) => {
      if (!relationship.readOnly) {
        relations.push(relationship.child.name);
      }
    });

    setTabs(relations);
  }, []);

  function download(item: MediaDto) {
    const downloadLink = document.createElement("a");
    downloadLink.href = item.publicUrl ?? item.file;
    downloadLink.download = item.name;
    downloadLink.click();
  }

  function preview(item: MediaDto) {
    setSelectedItem(item);
  }



  const getFormattedTextValue = (subType: string | null, value: string, editorType: string | null) => {
    if (!value) return "N/A";

    const className = "inline-block  truncate   items-center gap-5 text-sm text-orange-500 my-auto self-stretch underline decoration-solid decoration-auto underline-offset-auto";
    if (value === "N/A") return "N/A";
    switch (subType) {
      case "email":
        return (
          <div className="flex items-center gap-5 text-sm text-orange-500">
            <a href={`mailto:${value}`} className={className}>
              {value}
            </a>
          </div>
        );
      case "phone":
        return (
          <div className="flex items-center gap-5 text-sm text-orange-500">
            <a href={`tel:${value}`} className={className}>
              {value}
            </a>
          </div>
        );
      case "url":
        return (
          <div className="flex max-w-[180px]  items-center gap-5 text-sm text-orange-500">
            <a href={value} rel="noreferrer" target="_blank" className={className}>
              {value}
            </a>
          </div>
        );
      default:
        return <>{editorType ? <div dangerouslySetInnerHTML={{ __html: value }} /> : value}</>;
    }
  };

  const getFormattedMultiText = (rowValue: RowValueWithDetails) => {
    if (!rowValue?.multiple?.length) return "N/A";

    let textChips = rowValue?.multiple?.map((o: any) => o.value);
    return <KeywordTags tags={textChips} />;
  };

  const getFormattedSingleSelect = (rowValue: RowValueWithDetails) => {
    if (!rowValue?.textValue) return "N/A";
    return <KeywordTags tags={[rowValue?.textValue]} />;
  };

  const getFormattedMultiple = (rowValue: RowValueWithDetails) => {
    if (!rowValue?.multiple?.length) return "N/A";

    let multitextValues = rowValue?.multiple?.map((item) => item.value);
    return <KeywordTags tags={multitextValues} />;
  };

  const getValueByType = ({
    type,
    subType,
    rowValue,
    attributes,
  }: {
    type: number;
    subType: string | null;
    rowValue: RowValueWithDetails;
    attributes: any;
  }):  any => {
    const isRating = attributes?.find((item: any) => item.value === "rating") ? true : false;

    if (isRating) {
      return (
        <span>
          <RatingBadge value={Number(rowValue?.numberValue)} />
        </span>
      );
    }

    switch (type) {
      case PropertyType.TEXT:
        const editorType = attributes.find((item: any) => item.name === "editor")?.value;
        return getFormattedTextValue(subType, rowValue?.textValue  || "N/A", editorType);

      case PropertyType.BOOLEAN:
        return typeof rowValue?.booleanValue === "boolean" ? (rowValue.booleanValue ? "Yes" : "No") : "N/A";

      case PropertyType.NUMBER:
        return rowValue?.numberValue || "N/A";

      case PropertyType.DATE:
        return rowValue?.dateValue ? DateUtils.dateMonthDayYear(rowValue.dateValue) : "N/A";
      case PropertyType.RANGE_DATE:
        const minDate = rowValue?.range?.dateMin ? DateUtils.dateMonthDayYear(rowValue?.range?.dateMin) : "N/A";
        const maxDate = rowValue?.range?.dateMax ? DateUtils.dateMonthDayYear(rowValue?.range?.dateMax) : "N/A";
        return `${minDate} - ${maxDate}`;

      case PropertyType.MEDIA:
        return rowValue?.media ? (
          <>
            <MediaItem
              showReuploadButton={false}
              item={{
                id: rowValue?.media?.[0]?.id || "",
                title: rowValue?.media?.[0]?.title || "",
                name: rowValue?.media?.[0]?.name || "",
                file: rowValue?.media?.[0]?.file || "",
                type: rowValue?.media?.[0]?.type || "",
                publicUrl: rowValue?.media?.[0]?.publicUrl || undefined,
                storageBucket: rowValue?.media?.[0]?.storageBucket || undefined,
                storageProvider: rowValue?.media?.[0]?.storageProvider || undefined,
              }}
              onChangeTitle={function (e: string): void {
                throw new Error("Function not implemented.");
              }}
              onDelete={function (): void {
                throw new Error("Function not implemented.");
              }}
              onDownload={() => {
                const mediaItem = rowValue?.media?.[0];
                if (mediaItem) {
                  download(mediaItem);
                } else {
                  console.error("Media item is missing required properties.");
                }
              }}


              onPreview={
                rowValue?.media?.[0].type && (rowValue?.media?.[0].type.includes("pdf") || rowValue?.media?.[0].type.includes("image"))
                  ? () => preview(rowValue?.media?.[0])
                  : undefined
              }


            />
          </>
        ) : (
          "N/A"
        );

      case PropertyType.MULTI_SELECT:
        return getFormattedMultiple(rowValue);
      case PropertyType.MULTI_TEXT:
        return getFormattedMultiText(rowValue);

      case PropertyType.RANGE_NUMBER:
        return rowValue?.range?.numberMin && rowValue?.range?.numberMax ? `${rowValue?.range?.numberMin} - ${rowValue?.range?.numberMax}` : "N/A";
      case PropertyType.SELECT:
        return getFormattedSingleSelect(rowValue);

      default:
        return "Type N/A";
    }
  };

  const tabCounts: Record<string, number> = {};
  entity.parentEntities.forEach((relation) => {
    const relatedRowsData = relatedRows.find((r) => r.relationship.id === relation.id);
    const count = relatedRowsData?.rows?.length || 0;
    tabCounts[relation.parent.name] = count;
  });

  entity.childEntities.forEach((relation) => {
    const relatedRowsData = relatedRows.find((r) => r.relationship.id === relation.id);
    const count = relatedRowsData?.rows?.length || 0;
    tabCounts[relation.child.name] = count;
  });

  


  const renderActiveTabView = () => {
    switch (activeTab) {
      case "Details": {
        return groups.map((g, gIndex) => (
          <>
            {g.group ? (
              <section key={g.group} className="mt-4 w-full self-center px-4 text-sm max-md:max-w-full">
                <h2 className="self-start text-base font-semibold text-stone-950">{g.group}</h2>
              </section>
            ) : null}
            <section className="mt-4 flex w-full flex-wrap items-center gap-10 self-center px-4 text-sm max-md:max-w-full">
              {g.headers.map((groupHeader) => {
                const { id, label, type, subType, value, attributes } = transformHeader(groupHeader);
                const isFieldTextEditor = attributes?.some((attribute: any) => ["EditorSize", "editor", "EditorLanguage"].includes(attribute.name)) || false;
                const dynamicClass = clsx(type === PropertyType.MEDIA || isFieldTextEditor ? "w-full" : "min-w-60");
                return !["ID", "Models.row.folio", "Created at", "Created by"].includes(label) ? (
                  <div className={dynamicClass}>
                    <InfoSection key={id} label={label} value={getValueByType({ type, subType, rowValue: value, attributes })} />
                  </div>
                ) : null;
              })}
            </section>
            {gIndex < groups.length - 1 ? <hr className="mt-4 h-px w-full shrink-0 border border-solid border-zinc-100" /> : null}
          </>
        ));
      }
      default: {
        return renderRelationshipTab(activeTab);
      }
    }
  };

  return (
    <>
      <article className="flex max-w-full flex-col overflow-hidden rounded-xl border border-solid border-zinc-300 bg-white pb-28 max-md:pb-24">
        <TabNavigation tabs={["Details", ...tabs]} activeTab={activeTab} onTabChange={setActiveTab} tabCounts={tabCounts} />
        {renderActiveTabView()}
        <div className="flex justify-center items-center w-full bg-white mt-12">
          <ThatAllIcon />
        </div>
        <div className="flex justify-center items-center mt-4 text-[16px] font-semibold italic leading-none">That’s all for now!</div>
      </article>
      {selectedItem && (
        <PreviewMediaModal
          item={selectedItem}
          onClose={() => setSelectedItem(undefined)}
          onDownload={() => download(selectedItem)}
        />
      )}
    </>
  );
};

export default EntityDetails;
