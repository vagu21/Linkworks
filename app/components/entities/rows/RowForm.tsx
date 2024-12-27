import { RowWithDetails, RowWithValues } from "~/utils/db/entities/rows.db.server";
import { EntityWithDetails, PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { Dispatch, forwardRef, Fragment, ReactNode, Ref, SetStateAction, useEffect, useImperativeHandle, useRef, useState } from "react";
import clsx from "clsx";
import { updateItemByIdx } from "~/utils/shared/ObjectUtils";
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
import RowsList from "./RowsList";
import { EntityViewWithDetails } from "~/utils/db/entities/entityViews.db.server";
import { RowDisplayDefaultProperty } from "~/utils/helpers/PropertyHelper";
import { PropertyType } from "~/application/enums/entities/PropertyType";
import { PromptFlowWithDetails } from "~/modules/promptBuilder/db/promptFlows.db.server";
import RowUrlHelper from "~/utils/helpers/RowUrlHelper";
import { generateJsonFromContent } from "~/utils/openaiUtils";
import ClipLoader from "react-spinners/ClipLoader";
import { useNavigate } from "react-router-dom";
import { saveCandidateEntity, saveEducationHistory, saveEmploymentInformation, saveRelationship, updateCandidateEntity } from "~/utils/apiClient";
import NewMember from "~/components/core/settings/members/NewMember";
import { redirect, useTypedLoaderData } from "remix-typedjson";
import NewMemberRoute, { NewMemberLoaderData } from "~/routes/app.$tenant/settings/members/new";
import InputCheckboxWithDescription from "~/components/ui/input/InputCheckboxWithDescription";
// import { getUserByEmail } from "~/utils/db/users.db.server";
// import { getTenant, getTenantMember } from "~/utils/db/tenants.db.server";
import { createUserInvitation } from "~/utils/db/tenantUserInvitations.db.server";
import { getTenantIdFromUrl } from "~/utils/services/.server/urlService";
import EventsService from "~/modules/events/services/.server/EventsService";
import { TenantUserType } from "~/application/enums/tenants/TenantUserType";
import { MemberInvitationCreatedDto } from "~/modules/events/dtos/MemberInvitationCreatedDto";
import { ActionFunction, LoaderFunctionArgs } from "@remix-run/node";
import { verifyUserHasPermission } from "~/utils/helpers/.server/PermissionsService";
import { getUserInfo } from "~/utils/session.server";
import { getUser, getUserByEmail } from "~/utils/db/users.db.server";
import { getTenant, getTenantMember } from "~/utils/db/tenants.db.server";
import { sendEmail } from "~/utils/email.server";
import { getBaseURL } from "~/utils/url.server";
import { getTranslations } from "~/locale/i18next.server";
import { getPlanFeatureUsage } from "~/utils/services/.server/subscriptionService";
import { DefaultFeatures } from "~/application/dtos/shared/DefaultFeatures";
import { useFetcher } from "@remix-run/react";
import CompanyMemberTable from "~/custom/components/companyMemberTable";
import { toast } from "~/components/ui/use-toast";
import { country_arr, states } from "./CountryUtils";

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
  companyUserFormValues?: any;
  setCompanyUserFormValues?: (values: any) => void;
}
interface formDataCompany extends FormData {
     
    userEmail?:"string",
    firstName?:"string",
    lastName?:"string",
    sendInvitationEmail?:boolean
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
    companyUserFormValues,
    setCompanyUserFormValues
  }: Props,
  ref: Ref<RefRowForm>
) => {
  const { t } = useTranslation();
  const submit = useSubmit();
  const navigation = useNavigation();
  const navigate = useNavigate();

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
  const [showMemberForm, setShowMemberForm] = useState(false);

  const [candidateId, setCandidateId] = useState<string | null>(null);
  const [updatedCandidateData, setUpdatedCandidateData] = useState({
    uploadCandidateCvResumeHere: [],
    summary: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    languageSkills: [],
    technicalskills: [],
    proficiencyLevel: "",
    facebookProfileUrl: "",
    twitterProfileUrl: "",
    linkedinProfileUrl: "",
    githubProfileUrl: "",
    xingProfileUrl: "",
    source: "",
  });
  const [isLoading, setIsLoading] = useState(false);



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
    const dis = (f: EntityRelationshipWithDetails) => {
      return f.distinct ? true : false;
    };
    
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

  // function submitForm(formData: FormData) {
  //   if (onSubmit) {
  //     onSubmit(formData);
  //   } else {
  //     submit(formData, {
  //       method: "post",
  //     });
  //   }
  // }

  // 
  
  function submitForm(formData: formDataCompany) {
    if (entity.name === "Candidates" && candidateId && updatedCandidateData) {
      // Handle candidate update
      updateCandidateEntity(candidateId, updatedCandidateData)
        .then((updateResponse) => {
          if (updateResponse) {
            navigate(-1); // Navigate back upon successful update
          }
        })
        .catch((error) => {
          // console.error("Error updating candidate entity:", error);
        });
    } else if (entity.name === "companies") {
      // Handle company-related submission
      if (!companyUserFormValues || companyUserFormValues.length === 0) {
        alert("No company user found! Please add at least one company user.");
        return;
      }
  
      const user = companyUserFormValues[0]; // Use the first user in the array
      if (!user.email || !user.firstName || !user.lastName) {
        console.error("Missing required fields in company user data:", user);
        alert("Please provide valid company user details.");
        return;
      }
  
      // Append company user data to FormData
      if (formData instanceof FormData) {
        formData.append("userEmail", user.email);
        formData.append("firstName", user.firstName);
        formData.append("lastName", user.lastName);
        formData.append("sendInvitationEmail", user.sendInvitationEmail ? "true" : "false");
      }
  
      submit(formData, { method: "post" })
        
    } else {
      // Default submission
      if (onSubmit) {
        onSubmit(formData);
      } else {
        submit(formData, { method: "post" })
         
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

  function handleRemove(index: number) {
    if (setCompanyUserFormValues)
      setCompanyUserFormValues(companyUserFormValues?.filter((f: any, i: any) => i !== index));
  }
  // console.log(companyUserFormValues, "companyUserFormValues")
  const data = useTypedLoaderData<NewMemberLoaderData>();
  const [sendEmail, setSendEmail] = useState(false);
  const inputEmail = useRef<HTMLInputElement>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  // console.log(companyUserFormValues, "companyUserFormValues");

  
  // Function to get distinct values from relationships
  return (
    <>
    {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <ClipLoader color="#ffffff" size={50} />
        </div>
      )}
      <FormGroup
        ref={formGroup}
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
          setIsLoading={setIsLoading}
          setUpdatedCandidateData={setUpdatedCandidateData}
          setCandidateId={setCandidateId}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {childrenEntities.visible.map((relationship) => (
            <div key={relationship.id} className="col-span-12">
              <div className="space-y-2">
                <h3 className="text-sm font-medium leading-3 text-gray-800">
                  <div className="flex items-center space-x-1">
                    <div>
                      <span className=" font-light italic"></span> {t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship }))}
                      {/* {relationship.required && <span className="ml-1 text-red-500">*</span>} */}
                    </div>
                  </div>
                </h3>
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
                />
              </div>
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
        {entity.name == 'companies' && (
          <div onClick={() => setShowMemberForm(!showMemberForm)}>
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 ">
              Company Member
            </label>
            <div
              className="mt-1 h-12 flex items-center w-full border-2 border-dashed bg-white border-gray-300 rounded-md text-gray-400 px-4 cursor-pointer"
            >
              <span className="text-sm">Add Company Member</span>
            </div>
          </div>
        )
        }
        {
          showMemberForm && (<>
            <CompanyMemberTable companyUserFormValues={companyUserFormValues} setCompanyUserFormValues={setCompanyUserFormValues} />
          </>)
        }
        <div className="grid grid-cols-2 gap-4 ">
          {companyUserFormValues?.map((item: any, index: number) => {
            return (
              <div key={index} className="relative bg-white p-4 rounded-lg shadow-md">
                {/* Cross button in the top-right corner */}
                <button
                  onClick={() => handleRemove(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  aria-label="Remove"
                >
                  &times; {/* Cross symbol */}
                </button>
                {/* Item Details */}
                <p>Email: {item?.email}</p>
                <p>First Name: {item?.firstName}</p>
                <p>Last Name: {item?.lastName}</p>
                <p>Send Invitation Email: {item?.sendInvitationEmail ? "Yes" : "No"}</p>
              </div>
            );
          })}
        </div>
        {/* {companyUserFormValues?.map(({item, index}:any) => (
   (<>
   <div className="flex">
    <div>test</div>
  <div>{item?.email}</div>
  <div>{item?.firstName}</div>
  <div>{item?.lastName}</div>
  </div>
  
  </>)
))} */}
      </FormGroup>
      {/* // <OpenModal className="sm:max-w-4xl" onClose={() => setSearchingRelationshipRows(undefined)}> */}
      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={t("shared.select")}
        open={searchingRelationshipRows !== undefined}
        onClose={() => setSearchingRelationshipRows(undefined)}
      >
        {selectedRelatedEntity && searchingRelationshipRows && (
          <RowListFetcher
            currentView={selectedRelatedEntity.view}
            listUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.list + "?view=null"}
            newUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.new ?? ""}
            parentEntity={entity}
            onSelected={(rows) => {
              addRelationshipRow(searchingRelationshipRows, rows);
              setSearchingRelationshipRows(undefined);
            } }
            multipleSelection={selectedRelatedEntity.multiple}
            allEntities={allEntities} 
            distinct={searchingRelationshipRows.distinct}       />
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
}: {
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
        <button
          onClick={() => onFindEntityRows(relationship)}
          type="button"
          disabled={readOnly}
          className={clsx(
            "relative block w-full rounded-lg border-2 border-dashed border-gray-300 p-4 text-center",
            readOnly ? "cursor-not-allowed bg-gray-100" : "bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
          )}
        >
          <span className="flex items-center space-x-1 text-xs font-normal text-gray-500">
            {readOnly ? (
              <div>{t("shared.notSet")}</div>
            ) : (
              <>
                {type === "parent" && (
                  <>
                    <div>{t("shared.select")}</div>
                    <div className="lowercase">{t(relationship.parent.title)}</div>
                  </>
                )}
                {type === "child" && (
                  <>
                    <div>{t("shared.add")}</div>
                    <div className="lowercase">{t(relationship.child.title)}</div>
                  </>
                )}
              </>
            )}
          </span>
        </button>
      ) : (
        <div className="relative space-y-2 overflow-visible">
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
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <div>{RowHelper.getTextDescription({ entity, item, t, defaultsToFolio: true })}</div>
                  </div>
                </div>
              ))} */}
          <button
            onClick={() => onFindEntityRows(relationship)}
            type="button"
            className={clsx(
              "relative flex space-x-1 rounded-md border border-dashed border-gray-300 px-2 py-1 text-center text-xs text-gray-600 hover:border-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-500",
              readOnly && "hidden"
            )}
          >
            {type === "parent" && (
              <>
                <div>{t("shared.select")}</div>
                <div className="lowercase">{t(relationship.parent.title)}</div>
              </>
            )}
            {type === "child" && (
              <>
                <div>{t("shared.add")}</div>
                <div className="lowercase">{t(relationship.child.title)}</div>
              </>
            )}
          </button>
        </div>
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
  setIsLoading,
  setUpdatedCandidateData,
  setCandidateId,
}: {
  item?: RowWithDetails | null;
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
  setIsLoading: any;
  setUpdatedCandidateData: any;
  setCandidateId: any;
}) {
  const { t } = useTranslation();
  const rowValueInput = useRef<RefRowValueInput>(null);
  const [statesArr, setStatesArr] = useState<string[]>([]);
  const [groups, setGroups] = useState<{ group?: string; headers: RowValueDto[] }[]>([]);


  useEffect(() => {
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
    setGroups(groups);
  }, [groups.length, rowValues]);

  useEffect(() => {
    if (groups.length > 0 && groups[0].headers.length > 0) {
      // console.log("groups", groups);
      addHasCountryToState();
    }
  }, [groups]);
  function addHasCountryToState() {
    let countryName = '' as string | undefined;
    groups.forEach((group) => {
      let countryFound = false;
      group.headers.forEach((header) => {
        if (header.property.subtype === "country") {
          countryFound = true;
          countryName = header.textValue;
        }
      });
      // console.log("countryFound", countryFound);
      if (countryFound) {
        populateInitialStates(countryName);
        group.headers.forEach((header) => {
          if (header.property.subtype === "state") {
            header.property.hasCountry = true;
          }
        });
      } else {
        group.headers.forEach((header) => {
          if (header.property.subtype === "state") {
            header.property.hasCountry = false;
          }
        });
      }
    });
  }
  function populateInitialStates(country: string | undefined) {
    if (country && statesArr.length == 0) {
      let index = country_arr.indexOf(country);
      let curstates = states[index + 1].split("|");
      setStatesArr(curstates);
    }
  }

  function isVisible(rowValue: RowValueDto) {
         if (rowValue.property.name === "specialization" || rowValue.property.name === "ndaDocument" ) {
          const firstNameValue = rowValues.find((f) => f.property.name === "isSupplier")?.booleanValue;
          if (!firstNameValue) {
             return false;
           }
         }
        return true;
       }

  // function addHasCountryToState() {
  //   groups.forEach((group) => {
  //     let countryFound = false;

  //     group.headers.forEach((header) => {
  //       if (header.property.subtype === "country") {
  //         countryFound = true;
  //       }
  //     });
  //     if (countryFound) {
  //       group.headers.forEach((header) => {
  //         if (header.property.subtype === "state") {
  //           header.property.hasCountry = true;
  //         }
  //       });
  //     } else {
  //       group.headers.forEach((header) => {
  //         if (header.property.subtype === "state") {
  //           header.property.hasCountry = false;
  //         }
  //       });
  //     }
  //   });
  // }
  function getPropertyColumnSpan(property: PropertyWithDetails) {
    const columns = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Columns);
    if (columns === undefined || isNaN(columns) || (columns < 1 && columns > 12)) {
      return "col-span-12";
    }
    return `col-span-${columns}`;
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
  return (
    <>
      {groups.map(({ group, headers }, idx) => {
        return (
          <InputGroup key={idx} title={group ? t(group) : t("shared.details")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              {headers.map((detailValue, idxDetailValue) => {
              detailValue.property.subtype == 'country' && addHasCountryToState() 

                if (!isVisible(detailValue)) {
                          return null;
                      }
                return (
                  <div key={detailValue.propertyId} className={clsx("w-full", getPropertyColumnSpan(detailValue.property))}>
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

                      // onChangeMedia={(media) => {
                      //   onChange({
                      //     ...detailValue,
                      //     media: media as any,
                      //   });
                      //   if (media.filter((f) => f.type).length > 0) {
                      //     onSaveIfAllSet();
                      //   }
                      // }}
                      onChangeMedia={async (media) => {
                        setIsLoading(true);

                        onChange({
                          ...detailValue,
                          media: media as any,
                        });

                        const loadPdfToText = () => import("react-pdftotext");

                        // Trigger save if required
                        if (media.filter((f) => f.type).length > 0) {
                          onSaveIfAllSet();
                        }

                        // Process the uploaded PDF if it's for the "Candidates" entity
                        if (!item && entity.name === "Candidates") {
                          if (media.length === 1) {
                            const { file, type } = media[0];

                            if (type === "application/pdf" && file) {
                              try {
                                let validFile = file;

                                // If the file is base64, convert it into a File object
                                if (
                                  typeof file === "string" &&
                                  file.startsWith("data:application/pdf;base64,")
                                ) {
                                  const base64Data = file.split(",")[1]; // Extract base64 string
                                  const byteCharacters = atob(base64Data); // Decode base64
                                  const byteNumbers = new Uint8Array(byteCharacters.length);

                                  for (let i = 0; i < byteCharacters.length; i++) {
                                    byteNumbers[i] = byteCharacters.charCodeAt(i);
                                  }

                                  validFile = new File([byteNumbers], "uploaded.pdf", {
                                    type: "application/pdf",
                                  });
                                }

                                const validFileAsBase64 = async (file: any) => {
                                  if (
                                    typeof file === "string" &&
                                    file.startsWith("data:application/pdf;base64,")
                                  ) {
                                    return file.split(",")[1]; // Extract the Base64 content
                                  }

                                  if (file instanceof File) {
                                    return new Promise((resolve, reject) => {
                                      const reader = new FileReader();
                                      reader.onload = () => resolve(reader.result.split(",")[1]); // Extract Base64 content
                                      reader.onerror = reject;
                                      reader.readAsDataURL(file);
                                    });
                                  }

                                  throw new Error("Unsupported file format");
                                };

                                const fileBase64 = await validFileAsBase64(validFile);

                                const initialCandidateData = {
                                  uploadCandidateCvResumeHere: [],
                                  summary: "",
                                  firstName: "",
                                  lastName: "",
                                  email: "",
                                  phone: "",
                                  willingToRelocate: false,
                                  gender: "",
                                  dateOfBirth: "",
                                  languageSkills: [],
                                  technicalskills: [],
                                  proficiencyLevel: "",
                                  facebookProfileUrl: "",
                                  twitterProfileUrl: "",
                                  linkedinProfileUrl: "",
                                  githubProfileUrl: "",
                                  xingProfileUrl: "",
                                  source: "",
                                };



                                const candidateResponse = await saveCandidateEntity(
                                  initialCandidateData
                                );

                                if (candidateResponse && candidateResponse.id) {
                                  console.log("Candidate Entity ID:", candidateResponse.id);
                                } else {
                                  console.error("Failed to create candidate entity");
                                }

                                // Extract text from PDF
                                const extractedText = await (async () => {
                                  const { default: pdfToText } = await loadPdfToText();
                                  return pdfToText(validFile);
                                })();

                                // Generate JSON from the extracted text
                                const openAiJson = await generateJsonFromContent(extractedText);

                                if (openAiJson) {
                                  // Populate processedPdf using OpenAI JSON response
                                  const processedPdf = {
                                    summary: openAiJson.Summary || "",
                                    firstName: openAiJson.Name?.split(" ")[0] || "",
                                    lastName: openAiJson.Name?.split(" ")[1] || "",
                                    email: openAiJson.Email || "",
                                    phone: openAiJson.Phone_Number || "",
                                    languageSkills: openAiJson.LanguageSkills || "",
                                    technicalSkills: openAiJson.Skills?.join(", ") || "",
                                    linkedinProfileUrl: openAiJson.LinkedInProfileURL || "",
                                    location: openAiJson.Location || "",
                                  };

                                  

                                  

                                  const educationHistories = openAiJson.Education || [];
                                  let educationHistoryIds = [];

                                  for (const education of educationHistories) {
                                    const educationEntity = {
                                      schoolCollegeName: education.schoolCollegeName || "",
                                      educationQualification: education.educationQualification || "",
                                      educationalSpecialization: education.educationalSpecialization || "",
                                      grade: education.grade || "",
                                      location: education.location || "",
                                      startDate: education.startDate || "",
                                      endDate: education.endDate || "",
                                      description: education.description || "",
                                    };

                                    try {
                                      const saveEducationResponse = await saveEducationHistory(educationEntity);
                                     

                                      if (saveEducationResponse && saveEducationResponse.id) {
                                        educationHistoryIds.push(saveEducationResponse.id);
                                      }
                                    } catch (error) {
                                      console.error("Error saving education entity:", error);
                                    }
                                  }

                                  if (candidateResponse && candidateResponse.id && educationHistoryIds.length > 0) {
                                    for (const educationHistoryId of educationHistoryIds) {
                                      try {
                                        const relationshipData = {
                                          parent: candidateResponse.id,
                                          child: educationHistoryId,
                                        };

                                        const saveEducationRelationshipResponse = await saveRelationship(relationshipData);
                                        console.log("Education Relationship Created:", saveEducationRelationshipResponse);
                                      } catch (error) {
                                        console.error("Error creating relationship with Education History:", error);
                                      }
                                    }
                                  }

                                  const employmentHistories = openAiJson.Employment || [];
                                  let employmentHistoryIds = [];

                                  for (const employment of employmentHistories) {
                                    const employmentEntity = {
                                      title: employment.title || "",
                                      companyName: employment.companyName || "",
                                      employmentType: employment.employmentType || "",
                                      industryType: employment.industryType || "",
                                      location: employment.location || "",
                                      salary: typeof employment.salary === "number" ? employment.salary : 0,
                                      currentlyWorkingInThisRole: employment.currentlyWorkingInThisRole || false,
                                      startDate: employment.startDate || "",
                                      endDate: employment.endDate || "",
                                      description: employment.description || "",
                                    };

                                    try {
                                      const saveEmploymentResponse = await saveEmploymentInformation(
                                        employmentEntity
                                      );
                                      console.log("Saved Employment Entity:", saveEmploymentResponse);

                                      if (saveEmploymentResponse && saveEmploymentResponse.id) {
                                        employmentHistoryIds.push(saveEmploymentResponse.id);
                                      }
                                    } catch (error) {
                                      console.error("Error saving employment entity:", error);
                                    }
                                  }

                                  if (candidateResponse && candidateResponse.id && employmentHistoryIds.length > 0) {
                                    for (const employmentHistoryId of employmentHistoryIds) {
                                      try {
                                        const relationshipData = {
                                          parent: candidateResponse.id,
                                          child: employmentHistoryId,
                                        };

                                        const saveEmploymentRelationshipResponse = await saveRelationship(relationshipData);
                                        console.log("Employment Relationship Created:", saveEmploymentRelationshipResponse);
                                      } catch (error) {
                                        console.error("Error creating relationship with Employment History:", error);
                                      }
                                    }
                                  }

                                  // Update candidate properties
                                  const updateProperty = (propertyName: any, value: any) => {
                                    const property = headers.find(
                                      (f) => f.property.name === propertyName
                                    );
                                    if (property) {
                                      onChange({ ...property, textValue: value });
                                    }
                                  };

                                  updateProperty("summary", processedPdf.summary);
                                  updateProperty("firstName", processedPdf.firstName);
                                  updateProperty("lastName", processedPdf.lastName);
                                  updateProperty("email", processedPdf.email);
                                  updateProperty("phone", processedPdf.phone);
                                  updateProperty("linkedinProfileUrl", processedPdf.linkedinProfileUrl);

                                  // Update the candidate entity with the processed data
                                  if (candidateResponse && candidateResponse.id) {
                                    const candidateId = candidateResponse.id; // Get the candidate ID
                                    const updatedCandidateData = {
                                      uploadCandidateCvResumeHere: [
                                        {
                                          title: processedPdf.firstName || "Resume",
                                          name: "uploaded.pdf",
                                          file: fileBase64,
                                          type: "application/pdf",
                                        },
                                      ],
                                      summary: processedPdf.summary || "",
                                      firstName: processedPdf.firstName || "",
                                      lastName: processedPdf.lastName || "",
                                      email: processedPdf.email || "",
                                      phone: processedPdf.phone || "",
                                      willingToRelocate: false,
                                      gender: "",
                                      dateOfBirth: "",
                                      languageSkills: Array.isArray(processedPdf.languageSkills)
                                        ? processedPdf.languageSkills
                                        : processedPdf.languageSkills
                                          ? [processedPdf.languageSkills]
                                          : [],
                                      technicalskills: Array.isArray(processedPdf.technicalSkills)
                                        ? processedPdf.technicalSkills
                                        : processedPdf.technicalSkills
                                          ? [processedPdf.technicalSkills]
                                          : [],
                                      proficiencyLevel: "",
                                      facebookProfileUrl: "",
                                      twitterProfileUrl: "",
                                      linkedinProfileUrl: processedPdf.linkedinProfileUrl || "",
                                      githubProfileUrl: "",
                                      xingProfileUrl: "",
                                      source: "",
                                    };

                                    setUpdatedCandidateData(updatedCandidateData);
                                    setCandidateId(candidateId);


                                  }
                                }
                              } catch (error) {
                                console.error("Failed to extract text from PDF", error);
                              }
                            } else {
                              console.error("Invalid file or file type.");
                            }
                          }
                        }
                        setIsLoading(false);
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
                        (editing && !detailValue.property.canUpdate) || (item?.id !== undefined && (!editing || !canUpdate)) || detailValue.property?.isReadOnly
                      }
                      autoFocus={idx === 0 && idxDetailValue === 0 && canSubmit}
                      promptFlows={promptFlows ? { prompts: promptFlows, rowId: item?.id } : undefined}
                    />
                  </div>
                );
              })}
              {/* Show parent entities in Default Properties Group */}
              {!group && (
                <>
                  {parentEntities.visible.map((relationship) => (
                    <div key={relationship.id} className="col-span-12">
                      <label htmlFor={relationship.id} className="flex justify-between space-x-2 text-xs font-medium text-gray-600 ">
                        <div className=" flex items-center space-x-1">
                          <div className="truncate">
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
        );
      })}
    </>
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
