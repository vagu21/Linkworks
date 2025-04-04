import { RowWithDetails, RowWithValues } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { Dispatch, forwardRef, Fragment, ReactNode, Ref, SetStateAction, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import clsx from "clsx";
import { useNavigation, useParams, useSearchParams, useSubmit } from "@remix-run/react";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import FormGroup, { RefFormGroup } from "~/components/ui/forms/FormGroup";
import InputGroup from "~/components/ui/forms/InputGroup";
import RowHelper from "~/utils/helpers/RowHelper";
import RowValueInput, { RefRowValueInput } from "./RowValueInput";
import { LinkedAccountWithDetailsAndMembers } from "~/utils/db/linkedAccounts.db.server";
import PropertyAttributeHelper from "~/utils/helpers/PropertyAttributeHelper";
import { PropertyAttributeName } from "~/application/enums/entities/PropertyAttributeName";
import { useTranslation } from "react-i18next";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";
import RowListFetcher from "../../../modules/rows/fetchers/RowListFetcher";
import SlideOverWideEmpty from "~/components/ui/slideOvers/SlideOverWideEmpty";
import { EntitiesApi } from "~/utils/api/.server/EntitiesApi";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { RowsApi } from "~/utils/api/.server/RowsApi";
import { RowValueMultipleDto } from "~/application/dtos/entities/RowValueMultipleDto";
import RelationshipHelper from "~/utils/helpers/RelationshipHelper";
import RowsList, { AddMoreCard } from "./RowsList";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";
import RowUrlHelper from "~/utils/helpers/RowUrlHelper";
import CompanyMemberTable from "~/custom/components/companyMemberTable";
import { country_arr, states } from "./CountryUtils";
import { useProcessMediaFile } from "~/modules/mediaParser/useProcessMedia";
import FloatingLoader from "~/components/ui/loaders/FloatingLoader";
import { appendUserFormValues } from "~/modules/companyMembers/utils";
import { CompanyMembersView } from "~/modules/companyMembers/companyMembersView";

export interface RefRowForm {
  save: () => void;
}


interface Props {
  entity: EntityWithDetails;
  allEntities: EntityWithDetails[];
  routes?: EntitiesApi.Routes;
  item?: RowWithDetails | null;
  editing?: boolean;
  adding?: boolean;
  distinct?: boolean;
  linkedAccounts?: LinkedAccountWithDetailsAndMembers[];
  onSubmit?: (formData: FormData) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSubmit?: boolean;
  children?: ReactNode;
  parentEntity?: EntityWithDetails;
  onCreatedRedirect?: string;
  onDelete?: () => void;
  relationshipRows?: RowsApi.GetRelationshipRowsData;
  hiddenProperties?: string[];
  hiddenFields?: {
    [key: string]: string | null | undefined;
  };
  state?: { loading?: boolean; submitting?: boolean };
  createdRow?: RowWithDetails;
  onCancel?: () => void;
  onChange?: (values: RowValueDto[]) => void;
  customSearchParams?: URLSearchParams;
  promptFlows?: PromptFlowWithDetails[];
  template?: { title: string; config: string } | null;
  statesArr?: string[];
  setStatesArr?: Dispatch<SetStateAction<string[]>>;
  fields: string[];
  totalFields: number;
  formData: Record<string, string>;
}
interface formDataCompany extends FormData {
  userEmail?: "string";
  firstName?: "string";
  lastName?: "string";
  sendInvitationEmail?: boolean;
}

const RowForm = (
  {
    entity,
    routes,
    item,
    editing = false,
    adding,
    linkedAccounts,
    onSubmit,
    canUpdate,
    canDelete,
    canSubmit = true,
    children,
    parentEntity,
    onCreatedRedirect,
    allEntities,
    onDelete,
    distinct,
    relationshipRows,
    hiddenProperties,
    hiddenFields,
    state,
    createdRow,
    onCancel,
    onChange,
    customSearchParams,
    promptFlows,
    template,
    statesArr,
    setStatesArr,
    isSlideOverOrRowList = false,
    fields,
    totalFields,
    formData,
  }: Props & { isSlideOverOrRowList?: boolean },
  ref: Ref<RefRowForm>
) => {
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const companyMemberRef: any = useRef();
  const params = useParams();
  // const actionData = useActionData<{ newRow?: RowWithDetails }>();
  const formGroup = useRef<RefFormGroup>(null);
  const [searchParams] = useSearchParams();
  const [searchingRelationshipRows, setSearchingRelationshipRows] = useState<EntityRelationshipWithDetails>();
  const [selectedRelatedEntity, setSelectedRelatedEntity] = useState<{
    entity: { slug: string; onEdit: string | null };
    view: EntityViewWithDetails | null;
    multiple: boolean;
  }>();
  const [relatedRows, setRelatedRows] = useState<{ relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[]>([]);

  const [headers, setHeaders] = useState<RowValueDto[]>([]);

  const [childrenEntities, setChildrenEntities] = useState<{ visible: EntityRelationshipWithDetails[]; hidden: EntityRelationshipWithDetails[] }>({
    visible: [],
    hidden: [],
  });
  const [parentEntities, setParentEntities] = useState<{ visible: EntityRelationshipWithDetails[]; hidden: EntityRelationshipWithDetails[] }>({
    visible: [],
    hidden: [],
  });

  const [featureFlagValues, setFeatureFlagValues] = useState<any>({});

  async function getFeatureFlags() {
    const serverUrl = import.meta.env.VITE_PUBLIC_SERVER_URL;
    const data = await fetch(`${serverUrl}/api/getFeatureFlag?name=Company Members`, { credentials: "include" });
    const response = await data.json();
    setFeatureFlagValues(response);
  }

  useEffect(() => {
    if (entity.name == "Account") {
      getFeatureFlags();
    }
  }, []);

  useEffect(() => {
    loadInitialFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.entity, params.group, customSearchParams, template]);

  useEffect(() => {
    if (onChange) {
      onChange(headers);
    }
  }, [headers, onChange]);

  // useEffect(() => {
  //   if (headers.length > 0) {
  //     rowValueInput.current?.focus();
  //   }
  // }, [headers])

  // useEffect(() => {
  //   if (actionData?.newRow && onCreated) {
  //     onCreated(actionData.newRow);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [actionData]);

  useEffect(() => {
    if (searchingRelationshipRows?.parentId === entity.id) {
      setSelectedRelatedEntity({
        entity: searchingRelationshipRows.child,
        view: searchingRelationshipRows.childEntityView,
        multiple: true,
      });
    } else if (searchingRelationshipRows?.childId === entity.id) {
      setSelectedRelatedEntity({
        entity: searchingRelationshipRows.parent,
        view: searchingRelationshipRows.parentEntityView,
        multiple: false,
      });
    }
  }, [entity.id, searchingRelationshipRows]);

  useImperativeHandle(ref, () => ({
    save,
  }));
  function save() {
    formGroup.current?.submitForm();
  }

  function loadInitialFields() {
    const initial: RowValueDto[] = [];
    if (template && !customSearchParams) {
      const config = JSON.parse(template.config);
      const defaultValues: { [key: string]: any } = {};
      Object.keys(config).forEach((key) => {
        defaultValues[key] = config[key];
      });
      customSearchParams = new URLSearchParams(defaultValues);
    }
    entity.properties
      ?.filter((f) => isPropertyVisible(f))
      .forEach((property) => {
        const existing = item?.values?.find((f) => f?.propertyId === property.id);

        let urlSearchParams = customSearchParams ?? searchParams;
        const defaultValueString =
          RowUrlHelper.getString({ urlSearchParams, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
        const defaultValueNumber =
          RowUrlHelper.getNumber({ urlSearchParams, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.DefaultValue);
        const defaultValueBoolean =
          RowUrlHelper.getBoolean({ urlSearchParams, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_Boolean(property, PropertyAttributeName.DefaultValue);

        let defaultDate = RowUrlHelper.getDate({ urlSearchParams, property }) ?? undefined;
        const defaultRange = RowUrlHelper.getRange({ urlSearchParams, property }) ?? undefined;

        const defaultMultiple = RowUrlHelper.getMultiple({ urlSearchParams, property }) ?? undefined;

        initial.push({
          propertyId: property.id,
          property: property,
          textValue: existing?.textValue ?? defaultValueString ?? undefined,
          numberValue: existing?.numberValue ? Number(existing?.numberValue) : defaultValueNumber,
          dateValue: existing?.dateValue ?? defaultDate,
          booleanValue: existing ? Boolean(existing?.booleanValue) : defaultValueBoolean,
          selectedOption: existing?.textValue ?? defaultValueString ?? undefined,
          media: existing?.media ?? [],
          multiple: existing?.multiple.sort((a: RowValueMultipleDto, b: RowValueMultipleDto) => a.order - b.order) ?? defaultMultiple ?? [],
          range: existing?.range ?? defaultRange,
        });
      });

    const relatedRows: { relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[] = [];
    if (item) {
      entity.parentEntities.forEach((relationship) => {
        if (item.parentRows?.length > 0) {
          relatedRows.push({
            relationship,
            rows: item.parentRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.parent),
          });
        }
      });
      entity.childEntities.forEach((relationship) => {
        if (item.childRows?.length > 0) {
          relatedRows.push({
            relationship,
            rows: item.childRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.child),
          });
        }
      });
    } else {
      entity.parentEntities.forEach((relationship) => {
        const rowId = customSearchParams?.get(relationship.parent.name) ?? searchParams.get(relationship.parent.name);
        if (rowId) {
          const foundRow = relationshipRows
            ?.filter((f) => f.relationship.id === relationship.id)
            .map((m) => m.rows)
            .flat()
            .find((f) => f.id === rowId);
          relatedRows.push({
            relationship,
            rows: foundRow ? [foundRow] : [],
          });
        }
      });
    }

    const allChildren = entity.childEntities.filter((f) => childEntityVisible(f) && allEntities.find((x) => x.id === f.childId));
    setChildrenEntities(getVisibleRelatedEntities(allChildren, relatedRows));
    const allParents = entity.parentEntities.filter((f) => f.parentId !== parentEntity?.id && allEntities.find((x) => x.id === f.parentId));
    setParentEntities(getVisibleRelatedEntities(allParents, relatedRows));

    setHeaders(initial);
    setRelatedRows(relatedRows);
  }

  function onFindEntityRows(relationship: EntityRelationshipWithDetails) {
    if (!routes) {
      return;
    }
    setSearchingRelationshipRows(relationship);
  }

  function addRelationshipRow(relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) {
    const newRelatedRows = [...relatedRows];
    const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
    if (existing) {
      if (relationship.parentId === entity.id) {
        const nonExistingRows = rows.filter((f) => !existing.rows.find((ff) => ff.id === f.id));
        existing.rows = [...existing.rows, ...nonExistingRows];
      } else {
        existing.rows = rows;
      }
    } else {
      newRelatedRows.push({ relationship, rows });
    }
    setRelatedRows(newRelatedRows);
  }

  function setRelationshipRows(relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) {
    const newRelatedRows = [...relatedRows];
    const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
    if (existing) {
      existing.rows = rows;
    } else {
      newRelatedRows.push({ relationship, rows });
    }
    setRelatedRows(newRelatedRows);
  }

  function onRemoveRelatedRow(relationship: EntityRelationshipWithDetails, row: RowWithValues) {
    const newRelatedRows = [...relatedRows];
    const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
    if (existing) {
      existing.rows = existing.rows.filter((f) => f.id !== row.id);
    }
    setRelatedRows(newRelatedRows);
  }

  function addDynamicRow(relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) {
    setRelatedRows((prevRelatedRows) => {
      const newRelatedRows = [...prevRelatedRows];
      const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
      if (existing) {
        if (relationship.parentId === entity.id) {
          const nonExistingRows = rows.filter((f) => !existing.rows.find((ff) => ff.id === f.id));
          existing.rows = [...existing.rows, ...nonExistingRows];
        } else {
          existing.rows = rows;
        }
      } else {
        newRelatedRows.push({ relationship, rows });
      }

      allEntities.forEach((rel) => {
        if (!newRelatedRows.find((f) => f.relationship.id === rel.id)) {
          newRelatedRows.push({ relationship: rel as any, rows: [] });
        }
      });
      return newRelatedRows;
    });
  }

  // function submitForm(formData: FormData) {
  //   if (onSubmit) {
  //     onSubmit(formData);
  //   } else {
  //     submit(formData, {
  //       method: "post",
  //     });
  //   }
  // }

  function submitForm(formData: formDataCompany) {
    if (entity.name === "Account" && params.entity == "account") {
      // Handle company-related submission
      formData.append("enabled", featureFlagValues?.enabled);
      if (featureFlagValues?.enabled == true) {
        companyMemberRef?.current.handleSubmit(formData);
      }
      submit(formData, { method: "post" });
    } else {
      // Default submission
      if (onSubmit) {
        onSubmit(formData);
      } else {
        submit(formData, {
          method: "post",
        });
      }
    }
  }

  function isPropertyVisible(f: PropertyWithDetails) {
    if (f.isHidden || (!item && !f.showInCreate) || (!item && f.isReadOnly) || (item && editing && f.isReadOnly)) {
      return false;
    } else if (hiddenProperties?.includes(f.name)) {
      return false;
    }
    if (item && editing && !f.canUpdate) {
      return false;
    }

    return true;
  }

  function childEntityVisible(f: EntityRelationshipWithDetails) {
    if (f.readOnly) {
      if (!item) {
        return false;
      }
      if (item && editing) {
        return false;
      }
    }
    return true;
  }

  function canSubmitForm() {
    if (!canSubmit) {
      return false;
    }
    const required = headers.filter((f) => f.property.isRequired);
    let hasError = false;
    required.forEach((f) => {
      if (f.property.type === PropertyType.MEDIA) {
        if (f.media?.length === 0) {
          hasError = true;
        }
      }
    });
    return !hasError;
  }

  function isAddingOrEditing() {
    if (adding) {
      return true;
    }
    if (editing && item && canUpdate && navigation.state === "idle") {
      return true;
    }
    return false;
  }

  function onSaveIfAllSet() {
    return;
    // if (item) {
    //   return;
    // }
    // const missingValues = headers
    //   .filter((f) => isPropertyVisible(f.property))
    //   .map((header) => {
    //     if ([PropertyType.TEXT, PropertyType.SELECT].includes(header.property.type) && !header.textValue) {
    //       return header;
    //     } else if ([PropertyType.NUMBER].includes(header.property.type) && !header.numberValue) {
    //       return header;
    //     } else if ([PropertyType.DATE].includes(header.property.type) && !header.dateValue) {
    //       return header;
    //     }
    //     // else if ([PropertyType.MEDIA].includes(header.property.type) && (!header.media || header.media.length === 0)) {
    //     //   return header;
    //     // }
    //     else if ([PropertyType.MULTI_SELECT].includes(header.property.type) && (!header.multiple || header.multiple.length === 0)) {
    //       return header;
    //     }
    //     return null;
    //   });
    // const rowValues = missingValues.filter((f) => f !== null);

    // if (rowValues.length === 0) {
    //   formGroup.current?.submitForm();
    // }
  }

  const { parseMediaFile, isLoading, isAIAvailable } = useProcessMediaFile({
    addDynamicRow,
    childrenEntities,
    entityName: entity.name
  });
  function onChangePrefill(rowValue: RowValueDto) {
    setHeaders((prev) => {
      return prev.map((f) => {
        if (f.propertyId === rowValue.propertyId) {
          return rowValue;
        }
        return f;
      });
    });
  }
 
  // Function to get distinct values from relationships
  return (
    <>
      {isLoading && (
        <div>
          <FloatingLoader loading={isLoading} />
        </div>
      )}
      <FormGroup
        ref={formGroup}
        isDrawer={isSlideOverOrRowList}
        id={item?.id}
        editing={editing}
        canDelete={canDelete}
        onSubmit={submitForm}
        onDelete={onDelete}
        canUpdate={canUpdate}
        canSubmit={canSubmit}
        onCancel={onCancel}
        submitDisabled={!canSubmitForm()}
        onCreatedRedirect={onCreatedRedirect}
        deleteRedirect={EntityHelper.getRoutes({ routes, entity })?.list}
        state={state}
        message={
          createdRow
            ? { success: t("shared.created") + ": " + RowHelper.getTextDescription({ entity, item: createdRow, t, defaultsToFolio: true }) }
            : undefined
        }
        headers={headers}
        onChangePrefill={onChangePrefill}
        item={item}
        entity={entity}
        routes={routes}
        isAIAvailable={isAIAvailable}

      >
        {hiddenFields &&
          Object.keys(hiddenFields).map((f) => {
            return <Fragment key={f}>{hiddenFields[f] && <input type="hidden" name={f} value={hiddenFields[f] ?? ""} hidden readOnly />}</Fragment>;
          })}
        {!onSubmit && (
          <>
            {!item ? (
              <input type="hidden" name="redirect" value={EntityHelper.getRoutes({ routes, entity })?.list} hidden readOnly />
            ) : (
              <input type="hidden" name="redirect" value={EntityHelper.getRoutes({ routes, entity, item })?.overview} hidden readOnly />
            )}
          </>
        )}
        {onCreatedRedirect && <input type="hidden" name="onCreatedRedirect" value={onCreatedRedirect} hidden readOnly />}
        <RowGroups
          item={item}
          entity={entity}
          rowValues={headers}
          parentEntity={parentEntity}
          allEntities={allEntities}
          relatedRows={relatedRows}
          editing={editing}
          canUpdate={canUpdate}
          routes={routes}
          relationshipRows={relationshipRows}
          setHeaders={setHeaders}
          addRelationshipRow={addRelationshipRow}
          setRelationshipRows={setRelationshipRows}
          onFindEntityRows={onFindEntityRows}
          onRemoveRelatedRow={onRemoveRelatedRow}
          isPropertyVisible={isPropertyVisible}
          children={children}
          canSubmit={canSubmit}
          isAddingOrEditing={isAddingOrEditing()}
          parentEntities={{
            visible: parentEntities.visible,
            hidden: parentEntities.hidden,
            onAddParentEntity: (rel) => {
              setParentEntities((prev) => {
                return {
                  visible: [...prev.visible, rel],
                  hidden: prev.hidden.filter((f) => f.id !== rel.id),
                };
              });
            },
          }}
          promptFlows={promptFlows}
          onSaveIfAllSet={onSaveIfAllSet}
          parseMediaFile={parseMediaFile}
          isSlideOverOrRowList={isSlideOverOrRowList}
          fields={fields}
          totalFields={totalFields}
          formData={formData}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12 pl-4">
          {childrenEntities.visible.map((relationship) => (
            <div key={relationship.id} className="col-span-12">
              <section className="w-full">
                <div className=" p-4 w-full bg-white rounded-xl border shadow-lg border-zinc-100">
                  <div className="mb-3">
                    <h3 className="text-body text-label truncate font-bold">
                      <div className="flex items-center space-x-1">
                        <div>
                          <span className="text-[16px] font-bold leading-[19px] text-[#121212] "></span>{" "}
                          {t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship }))}
                        </div>
                      </div>
                    </h3>
                  </div>
                  <div>
                    <RelationshipSelector
                      fromEntity={entity}
                      type="child"
                      relationship={relationship}
                      relatedRows={relatedRows}
                      onFindEntityRows={onFindEntityRows}
                      allEntities={allEntities}
                      onRemoveRelatedRow={onRemoveRelatedRow}
                      readOnly={item?.id !== undefined && (!editing || !canUpdate)}
                      routes={routes}
                      relationshipRows={relationshipRows}
                      addRelationshipRow={addRelationshipRow}
                      setRelationshipRows={setRelationshipRows}
                      isSlideOverOrRowList={isSlideOverOrRowList}
                    />
                  </div>
                </div>
              </section>
            </div>

          ))}

          {isAddingOrEditing() && (
            <AddHiddenRelationshipEntities
              items={childrenEntities.hidden}
              onClick={(rel) => {
                setChildrenEntities((prev) => {
                  return {
                    visible: [...prev.visible, rel],
                    hidden: prev.hidden.filter((f) => f.id !== rel.id),
                  };
                });
              }}
              type="child"
            />
          )}
        </div>

        {relatedRows.map(({ relationship, rows }) => (
          <Fragment key={relationship.id}>
            {rows.map((row) => (
              // <>
              <input
                key={row.id}
                type="hidden"
                readOnly
                hidden
                name={`${relationship.childId === entity.id ? `parents[${relationship.parent.name}]` : `children[${relationship.child.name}]`}`}
                value={row.id}
              />
              // </>
            ))}
          </Fragment>
        ))}
        {entity.name == "Account" && params.entity == "account" && featureFlagValues?.enabled == true && (
          <CompanyMembersView ref={companyMemberRef} params={params} />
        )}
      </FormGroup>
      {/* // <OpenModal className="sm:max-w-4xl" onClose={() => setSearchingRelationshipRows(undefined)}> */}
      <SlideOverWideEmpty
        withTitle={true}
        withClose={false}
        title=
        {
          <>
            <span style={{ color: 'black', fontWeight: '600' }}>
              {t("shared.add")} {((selectedRelatedEntity?.entity as any)?.name) || ''}
            </span>
          </>
        }
        open={searchingRelationshipRows !== undefined}
        onClose={() => setSearchingRelationshipRows(undefined)}
        size="5xl"
      >
        {selectedRelatedEntity && searchingRelationshipRows && (
          <RowListFetcher
            titleop={entity.name}
            currentView={selectedRelatedEntity.view}
            listUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.list + "?view=null"}
            newUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.new ?? ""}
            parentEntity={entity}
            onSelected={(rows) => {
              if (rows.some(row => row.entityId === entity.id)) {
                console.error("Cannot create a relationship with the same entity.");
                return;
              }
              addRelationshipRow(searchingRelationshipRows, rows);
              setSearchingRelationshipRows(undefined);
            }}
            multipleSelection={selectedRelatedEntity.multiple}
            allEntities={allEntities.filter(e => e.id !== entity.id)} // Exclude current entity from the list
            distinct={searchingRelationshipRows.distinct}
          />
        )}
      </SlideOverWideEmpty>

      {/* // </OpenModal> */}
    </>
  );
};

function RelationshipSelector({
  fromEntity,
  routes,
  type,
  relationship,
  relatedRows,
  onFindEntityRows,
  className,
  allEntities,
  onRemoveRelatedRow,
  readOnly,
  relationshipRows,
  addRelationshipRow,
  setRelationshipRows,
  isSlideOverOrRowList = false,
}: {
  isSlideOverOrRowList?: boolean;
  fromEntity: EntityWithDetails;
  type: "child" | "parent";
  relationship: EntityRelationshipWithDetails;
  relatedRows: { relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[];
  onFindEntityRows: (relationship: EntityRelationshipWithDetails) => void;
  className?: string;
  allEntities: EntityWithDetails[];
  onRemoveRelatedRow: (relationship: EntityRelationshipWithDetails, row: RowWithValues) => void;
  readOnly: boolean;
  routes?: EntitiesApi.Routes;
  relationshipRows?: RowsApi.GetRelationshipRowsData;
  addRelationshipRow: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
  setRelationshipRows: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
}) {
  const { t } = useTranslation();
  const [entity] = useState(
    type === "parent"
      ? {
        entity: getChildEntity(relationship)!,
        view: relationship.parentEntityView,
      }
      : {
        entity: getParentEntity(relationship)!,
        view: relationship.childEntityView,
      }
  );

  function getRows(relationship: EntityRelationshipWithDetails) {
    const existing = relatedRows.find((f) => f.relationship.id === relationship.id);
    return existing?.rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
  }
  function getParentEntity(relationship: EntityRelationshipWithDetails) {
    return allEntities.find((f) => f.id === relationship.childId);
  }
  function getChildEntity(relationship: EntityRelationshipWithDetails) {
    return allEntities.find((f) => f.id === relationship.parentId);
  }
  return (
    <div className={className}>
      {/* <div>selectedRow: {getSelectedRow()}</div>
      <div>
        options:{" "}
        {getOptions()
          .map((f) => f.value)
          .join(",")}
      </div>
      <div>
        {relatedRows.filter((f) => f.relationship.id === relationship.id).length > 0 &&
          relatedRows
            .filter((f) => f.relationship.id === relationship.id)[0]
            .rows.map((f) => f.id)
            .join(",")}
      </div> */}
      {/* {RelationshipHelper.getInputType({ fromEntityId: fromEntity.id, relationship }) === "single-select" ? (
        <InputSelector
          className="mt-1"
          name={relationship.parent.name}
          disabled={readOnly}
          value={getSelectedRow()}
          options={getOptions()}
          setValue={(value) => {
            const row = relationshipRows?.find((f) => f.relationship.id === relationship.id)?.rows.find((f) => f.id === value);
            if (row) {
              setRelationshipRows(relationship, [row]);
            }
          }}
        />
      ) : RelationshipHelper.getInputType({ fromEntityId: fromEntity.id, relationship }) === "multi-select" ? (
        <> */}
      {getRows(relationship).length === 0 ? (
        <div
          // onClick={() => onFindEntityRows(relationship)}
          // type="button"
          // disabled={readOnly}
          className={clsx(
            "  !border-[#E6E6E6] !bg-[#FAFAFA] relative block w-full  rounded-lg border-2 border-dashed px-4 py-3 text-center",
            readOnly
              ? "!bg-[#FAFAFA] cursor-not-allowed"
              : "!bg-[#FAFAFA] hover:border-[#E6E6E6] focus:outline-none focus:ring-2 focus:ring-gray-500"
          )}
        >
          <span className="flex items-center space-x-1 text-xs font-normal text-gray-500">
            {readOnly ? (
              <div>{t("shared.notSet")}</div>
            ) : (
              <>
                {type === "parent" && (
                  <>
                    <div className="flex w-full flex-col justify-between sm:flex-row ">
                      <div className="text-small text-relationTitle flex flex-col items-center gap-1 font-normal italic leading-[14px] sm:flex-row">
                        <div>{t("shared.no")}</div>
                        <div className="lowercase">{t(relationship.parent.titlePlural)}</div>
                        <div>have been added</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onFindEntityRows(relationship);
                        }}
                        className="bg-orange-50 border-[1px] border-orange-500 rounded-md px-4 py-0.5 text-sm font-semibold leading-[24px] text-orange-500 hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        Add {t(relationship.parent.titlePlural)}
                      </button>
                    </div>
                  </>
                )}
                {type === "child" && (
                  <>
                    <div className="flex flex-col sm:flex-row w-full justify-between ">
                      <div className="text-small flex flex-col sm:flex-row items-center gap-1 font-normal italic leading-[14px] text-[#180505]">
                        <div>{t("shared.no")}</div>
                        <div className="lowercase">{t(relationship.child.titlePlural)}</div>
                        <div>have been added yet</div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          onFindEntityRows(relationship);
                        }}
                        className="bg-orange-50 border-[1px] border-orange-500 rounded-md px-4 py-0.5 text-sm font-semibold leading-[24px] text-orange-500 hover:bg-orange-100 hover:text-orange-500 hover:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
                      >
                        Add {t(relationship.child.titlePlural)}
                      </button>
                    </div>
                  </>
                )}
              </>
            )}
          </span>
        </div>
      ) : (
        <div className="relative space-y-2 overflow-visible w-full">
          <RowsList
            entity={entity.entity}
            items={getRows(relationship) as RowWithDetails[]}
            currentView={entity.view}
            view={(entity.view?.layout ?? "card") as "table" | "board" | "grid" | "card"}
            readOnly={readOnly}
            onRemove={readOnly ? undefined : (row) => onRemoveRelatedRow(relationship, row)}
            ignoreColumns={!readOnly ? [RowDisplayDefaultProperty.FOLIO, "parent." + relationship.parent.name, "child." + relationship.child.name] : []}
            routes={routes}
          />
          {/* {getRows(relationship).map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "group relative w-full overflow-visible truncate rounded-md border border-gray-300 px-4 py-3 text-left text-sm",
                    !readOnly ? "bg-white hover:border-gray-500" : "bg-gray-100"
                  )}
                >
                  <button
                    onClick={() => onRemoveRelatedRow(relationship, item)}
                    type="button"
                    disabled={readOnly}
                    className={clsx(
                      "absolute right-0 top-0 mr-2 mt-2 hidden origin-top-right justify-center rounded-full bg-white text-gray-600",
                      readOnly ? "cursor-not-allowed" : "hover:text-red-500 group-hover:flex"
                    )}
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0  0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <div>{RowHelper.getTextDescription({ entity, item, t, defaultsToFolio: true })}</div>
                  </div>
                </div>
              ))} */}

          {/* <div className="flex space-x-3 pt-4"> */}
          {/* <AddMoreCard
  entity={entity.entity}
  routes={routes}
  title={t(entity.entity.title)}
/> */}
          <div className="flex justify-end gap-1 pt-2">
            <button
              onClick={() => onFindEntityRows(relationship)}
              type="button"
              className={clsx(
                "relative flex  space-x-1 rounded-[4px] border-[1px]  border-gray-300 px-2 py-1 text-center text-xs text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500",
                readOnly && "hidden"
              )}
            >
              {type === "parent" && (
                <>
                  {/* <div>{t("shared.add")}</div> */}
                  <div className="text-body font-medium leading-5 text-black">{t(relationship.distinct ? "shared.add" : "Add")}</div>
                  <div className="text-body font-medium lowercase leading-5 text-black ">{t(relationship.parent.title)}</div>
                </>
              )}
              {type === "child" && (
                <>
                  {/* <div>{t("shared.add")}</div> */}
                  <div className="text-body font-medium leading-5 text-black">{t(relationship.distinct ? "shared.add" : "Add")}</div>
                  <div className="text-body font-medium lowercase leading-5 text-black">{t(relationship.child.title)}</div>
                </>
              )}
            </button>
          </div>
        </div>
        // </div>
      )}
      {/* </>
      ) : null} */}
    </div>
  );
}

function RowGroups({
  item,
  entity,
  rowValues,
  parentEntity,
  allEntities,
  relatedRows,
  editing,
  canUpdate,
  routes,
  relationshipRows,
  setHeaders,
  addRelationshipRow,
  setRelationshipRows,
  onFindEntityRows,
  onRemoveRelatedRow,
  isPropertyVisible,
  children,
  canSubmit,
  isAddingOrEditing,
  parentEntities,
  promptFlows,
  onSaveIfAllSet,
  parseMediaFile,
  isSlideOverOrRowList = false,
  fields = [],
  totalFields,
  formData = {},
}: {
  isSlideOverOrRowList?: boolean;
  item?: RowWithDetails | null;
  fields: string[];
  formData: Record<string, string>;
  totalFields: number;
  entity: EntityWithDetails;
  rowValues: RowValueDto[];
  parentEntity?: EntityWithDetails;
  allEntities: EntityWithDetails[];
  relatedRows: { relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[];
  editing?: boolean;
  canUpdate?: boolean;
  routes?: EntitiesApi.Routes;
  relationshipRows?: RowsApi.GetRelationshipRowsData;
  setHeaders: Dispatch<SetStateAction<RowValueDto[]>>;
  addRelationshipRow: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
  setRelationshipRows: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
  onFindEntityRows: (relationship: EntityRelationshipWithDetails) => void;
  onRemoveRelatedRow: (relationship: EntityRelationshipWithDetails, row: RowWithValues) => void;
  isPropertyVisible: (property: PropertyWithDetails) => boolean;
  children?: ReactNode;
  canSubmit?: boolean;
  isAddingOrEditing: boolean;
  parentEntities: {
    visible: EntityRelationshipWithDetails[];
    hidden: EntityRelationshipWithDetails[];
    onAddParentEntity: (item: EntityRelationshipWithDetails) => void;
  };
  promptFlows?: PromptFlowWithDetails[];
  onSaveIfAllSet: () => void;
  parseMediaFile: any;
}) {
  const { t } = useTranslation();
  const rowValueInput = useRef<RefRowValueInput>(null);
  const [statesArr, setStatesArr] = useState<string[]>([]);

  const  addDynamicRow = () => {};
  const childrenEntities = { visible: [], hidden: [] }
  
  const { groups, hasCountry } = useMemo(() => {
    const groups: { group?: string; headers: RowValueDto[] }[] = [];

    rowValues.forEach((header) => {
      const groupName = PropertyAttributeHelper.getPropertyAttributeValue_String(header.property, PropertyAttributeName.Group);
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
      groups.push({ headers: rowValues });
    }

    const hasCountry = groups.some((group) => group.headers.some((header) => header.property.subtype === "country"))

    if(hasCountry) {
      groups.forEach(group => {
        group.headers.forEach((header) => {
          if (header.property.subtype === "state") {
            header.property.hasCountry = hasCountry;
          }
        });
      })
    }
  
    return {
      groups,
      hasCountry
    };
  }, [rowValues]);

  useEffect(() => {
    if (!hasCountry) return;

    const populateInitialStates = (country: string | undefined) => {
      if (country && statesArr.length == 0) {
        let index = country_arr.indexOf(country);
        let curstates = states[index + 1].split("|");
        setStatesArr(curstates);
      }
    };

    const addHasCountryToState = () => {
      if (!groups.length || !groups[0].headers.length) return;
  
      groups.forEach((group) => {
        const countryHeader = group.headers.find((header) => header.property.subtype === "country" && header.textValue);
        if (countryHeader) {
          populateInitialStates(countryHeader.textValue);
        }
      });
    };
  
    addHasCountryToState();
  }, [hasCountry, groups]);
  

  function isVisible(rowValue: RowValueDto) {
    if (rowValue.property.name === "specialization" || rowValue.property.name === "ndaDocument") {
      const firstNameValue = rowValues.find((f) => f.property.name === "isSupplier")?.textValue;
      if (firstNameValue !== "Supplier") {
        return false;
      }
    }
    return true;
  }

  function onChange(rowValue: RowValueDto) {
    setHeaders((prev) => {
      return prev.map((f) => {
        if (f.propertyId === rowValue.propertyId) {
          return rowValue;
        }
        return f;
      });
    });
  }


  const [filledFieldsCounts, setFilledFieldsCounts] = useState<Record<string, number>>({}); // Track count per group

  useEffect(() => {
    const filledCounts: Record<string, number> = {};
    groups.forEach(({ group, headers }) => {
      let groupFilledCount = 0;
      headers.forEach((header) => {
        const isFilled = (
          (header.textValue?.trim() !== "" && header.textValue !== undefined) || // Standard text field
          (header.numberValue !== undefined && !isNaN(header.numberValue)) || // Number field
          (header.booleanValue !== undefined) || // Boolean field
          (header.dateValue !== undefined) || // Date field
          (header.range !== undefined) || // Range field
          (header.multiple && header.multiple.length > 0) || // Array (multi-select) field
          (header.media && header.media.length > 0) || // Media (file upload) field
          // Handle multi-text (split by newline)
          (typeof header.textValue === "string" && header.textValue.split('\n').filter(line => line.trim() !== "").length > 0) // Multi-line text (split by Enter key)
        );

        if (isFilled) {
          groupFilledCount++;
        }
      });

      // Store the count for the group
      filledCounts[group || "default"] = groupFilledCount;
    });

    setFilledFieldsCounts(filledCounts);
  }, [groups]);

  return (
    <div className={`grid w-full-[50px] gap-4 sm:grid-cols-1 md:grid-cols-1 relative`}>
      {groups.map(({ group, headers }, originalIndex) => {
        const isMediaGroup = headers.some((h) => h.property.type === PropertyType.MEDIA);
        const isLast = (originalIndex === groups.length-1);
        return (
          <div
            key={originalIndex}
            className={clsx(
              {
                "flex flex-col items-start pl-4 flex-none order-0 flex-grow-0":
                  !isSlideOverOrRowList,
              },
              isMediaGroup && "col-span-1"
            )}
          >
            <InputGroup
              className=""
              title={group ? t(group).trim() : t("shared.details")}
              totalFields={headers.length}
              defaultOpen={true}
              isLast={isLast}
              filled={filledFieldsCounts[group || "default"]}
              isDrawer={isSlideOverOrRowList}
              lineStyle={!isLast?{height:"calc(100% + 6rem)"}:{display:'none'}}
            >
              <div className="flex flex-col md:flex-row flex-wrap items-start gap-y-[20px] gap-[24px] self-stretch">
                {headers.map((detailValue, idxDetailValue) => {
                  if (!isVisible(detailValue)) {
                    return null;
                  }
                  const isFieldTextEditor = detailValue?.property?.attributes?.some((attribute) => ["EditorSize", "editor", "EditorLanguage"].includes(attribute.name)) || false;
                  
                  return (
                    <div
                      key={detailValue.propertyId}
                      // getPropertyColumnSpan(detailValue.property)
                      className={clsx(
                        `w-full  ${
                          detailValue?.property?.type == PropertyType.MEDIA || detailValue?.property?.subtype == "radioGroupCards" || isFieldTextEditor
                            ? "w-full"
                            : "md:w-[calc(50%-20px)]"
                        }`
                      )}
                    >
                      <RowValueInput
                        ref={rowValueInput}
                        entity={entity}
                        statesArr={statesArr}
                        setStatesArr={setStatesArr}
                        textValue={detailValue.textValue}
                        numberValue={detailValue.numberValue}
                        dateValue={detailValue.dateValue}
                        booleanValue={detailValue.booleanValue}
                        multiple={detailValue.multiple}
                        range={detailValue.range}
                        initialOption={detailValue.selectedOption}
                        selected={detailValue.property}
                        initialMedia={detailValue.media}
                        onChange={(e) => {
                          onChange({
                            ...detailValue,
                            ...RowHelper.updateFieldValueTypeArray(detailValue, e),
                          });
                        }}
                        onChangeOption={(e) => {
                          onChange({
                            ...detailValue,
                            selectedOption: e,
                            textValue: e,
                          });
                        }}
                        onChangeMedia={async (media) => {
                          onChange({
                            ...detailValue,
                            media: media as any,
                          });
                          if (media.filter((f) => f.type).length > 0) {
                            onSaveIfAllSet();
                          }
                          parseMediaFile(headers, onChange, media, item, entity, routes,"",detailValue.property.name);
                        }}
                        onChangeMultiple={(e) => {
                          onChange({
                            ...detailValue,
                            multiple: e as any[],
                          });
                        }}
                        onChangeRange={(e) => {
                          onChange({
                            ...detailValue,
                            range: e as any,
                          });
                        }}
                        readOnly={
                          (editing && !detailValue.property.canUpdate) ||
                          (item?.id !== undefined && (!editing || !canUpdate)) ||
                          detailValue.property?.isReadOnly
                        }
                        autoFocus={originalIndex === 0 && idxDetailValue === 0 && canSubmit}
                        promptFlows={promptFlows ? { prompts: promptFlows, rowId: item?.id } : undefined}
                      />
                    </div>
                  );
                })}
                {/* Show parent entities in Default Properties Group */}
                {!group && (
                  <>
                    {parentEntities.visible.map((relationship) => (
                      <div key={relationship.id} className="w-full col-span-12 py-1">
                        <label htmlFor={relationship.id} className="flex justify-between space-x-2 text-xs font-medium text-gray-600 ">
                          <div className=" flex flex-col sm:flex-row items-center space-x-1 ">
                            <div className="truncate text-sub-heading-2 leading-5 font-semibold text-[#180505] pb-[20px]">
                              {t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship }))}
                              {relationship.required && <span className="ml-1 text-red-500">*</span>}
                            </div>
                          </div>
                        </label>
                        <RelationshipSelector
                          fromEntity={entity}
                          className="mt-1"
                          type="parent"
                          relationship={relationship}
                          relatedRows={relatedRows}
                          onFindEntityRows={onFindEntityRows}
                          allEntities={allEntities}
                          onRemoveRelatedRow={onRemoveRelatedRow}
                          readOnly={item?.id !== undefined && (!editing || !canUpdate)}
                          routes={routes}
                          isSlideOverOrRowList={true}
                          relationshipRows={relationshipRows}
                          addRelationshipRow={addRelationshipRow}
                          setRelationshipRows={setRelationshipRows}
                        />
                      </div>
                    ))}

                    {isAddingOrEditing && (
                      <AddHiddenRelationshipEntities items={parentEntities.hidden} onClick={parentEntities.onAddParentEntity} type="parent" />
                    )}
                  </>
                )}
                {/* Show custom properties in Default Properties Group */}
                {!group && <>{children}</>}
              </div>
            </InputGroup>

          </div>

        );
      })}
    </div>
  );
}

function AddHiddenRelationshipEntities({
  items,
  onClick,
  type,
}: {
  items: EntityRelationshipWithDetails[];
  onClick: (item: EntityRelationshipWithDetails) => void;
  type: "parent" | "child";
}) {
  const { t } = useTranslation();
  return (
    <Fragment>
      {items.length > 0 && (
        <div className="col-span-12 flex flex-wrap items-center">
          {items.map((relationship) => (
            <button
              key={relationship.id}
              type="button"
              onClick={() => onClick(relationship)}
              className=" m-0.5 w-auto rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200"
            >
              {t("shared.add")} {type === "parent" ? t(relationship.parent.title) : t(relationship.child.title)}
            </button>
          ))}
        </div>
      )}
    </Fragment>
  );
}

function getVisibleRelatedEntities(
  entityRelationships: EntityRelationshipWithDetails[],
  relatedRows: { relationship: EntityRelationshipWithDetails; rows: RowWithValues[] }[]
) {
  const visible = entityRelationships.filter((f) => !f.hiddenIfEmpty);
  const hidden: EntityRelationshipWithDetails[] = [];

  entityRelationships
    .filter((f) => f.hiddenIfEmpty)
    .forEach((relationship) => {
      const rows = relatedRows.filter((f) => f.relationship.id === relationship.id).flatMap((f) => f.rows);
      if (rows.length > 0) {
        visible.push(relationship);
      } else {
        hidden.push(relationship);
      }
    });

  return {
    visible,
    hidden,
  };
}

export default forwardRef(RowForm);
