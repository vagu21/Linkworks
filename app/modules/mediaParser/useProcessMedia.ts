import { useState } from "react";
import { entityListData, saveTenantEducationHistory, saveTenantProjects, saveTenantTechnicalSkills, saveTenantWorkExperience } from "./resume/entityapiService";
import { generateJsonFromContent } from "./resume/resumeBot";
import { generateJsonFromJD } from "./job/jobBot";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { useParams } from "@remix-run/react";
import toast from "react-hot-toast";
import { PropertyType } from "~/application/enums/entities/PropertyType";
type ProcessCandidateArgs = {
  addDynamicRow: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
  childrenEntities: { visible: EntityRelationshipWithDetails[]; hidden: EntityRelationshipWithDetails[] };
  entityName?: string;
};

const propertyMappings = {
  description: "Description",
  title: "Title",
  status: "Status",
  numberOfOpenings: "No of openings",
  type: "Job-Type",
  remote: "Remote",
  // experience: "Experience",
  salaryType: "Salary-Type",
  salary: "Salary",
  category: "JobCategory",
  skills: "Skills",
  experienceLevel: "Experience-Level",
  applicationDeadline: "Job-Deadline",
  postedDate: "Posted-Date",
  targetHiringDate: "Target-Hiring-Date",
  educationalQualification: "Educational-Qualification",
  educationalSpecialization: "Educational-Specialization",
  currency: "Currency-Type",
  location: "Location",
};

const propertyMappingsResume = {
  firstName: "FirstName",
  lastName: "LastName",
  summary: "Summary",
  email: "Email",
  phone: "Phone_Number",
  dateOfBirth: "Date_of_Birth",
  aadhaarNumber: "AdhaarNumber",
  linkedinProfileUrl: "LinkedInProfileURL",
  facebookProfileUrl: "facebookProfileUrl",
  twitterProfileUrl: "twitterProfileUrl",
  githubProfileUrl: "githubProfileUrl",
  xingProfileUrl: "xingProfileUrl",
  reference: "reference",
  status: "status",
  currentDesignation: "currentDesignation",
  totalExperienceInYears: "totalExperienceInYears",
  panNumber: "panNumber",
  availability: "availability",
  universalAccountNumberUan: "universalAccountNumberUan",
  willingToRelocate: "willingToRelocate",
  pfNumber: "pfNumber",
  skills: "CandidateSkills",
  noticePeriod: "noticePeriod",
  currentLocation: "currentLocation",
  portfolio: "portfolioLink",
  other: "otherProfileUrl",
  referenceId: "referenceId",
  referenceEmailId: "referenceEmail",
};

const checkAIAvailability = (entityName: string = "") => {
  return ["job"].includes(entityName.toLowerCase().trim());
};

export const useProcessMediaFile = ({ addDynamicRow = () => {}, childrenEntities = { visible: [], hidden: [] }, entityName = "" }: ProcessCandidateArgs) => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const tenantSlug = params.tenant;

  const isAIAvailable = checkAIAvailability(entityName);

  const loadPdfToText = async () => {
    const { default: pdfToText } = await import("react-pdftotext");
    return pdfToText;
  };

  const validateDate = (date: string): Date | undefined => {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? undefined : parsedDate;
  };

  const extractFileFromMedia = async (media: any) => {
    const { file, type } = media[0];
    if (type !== "application/pdf" || !file) return null;
    if (typeof file === "string" && file.startsWith("data:application/pdf;base64,")) {
      const base64Data = file.split(",")[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Uint8Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      return new File([byteNumbers], "uploaded.pdf", { type: "application/pdf" });
    }
    return file;
  };

  const formatDate = (date: any): string | null => {
    const [day, month, year] = date.split("-");
    const formattedDate = new Date(`${year}-${month}-${day}`);

    // If the date is invalid, return null
    if (isNaN(formattedDate.getTime())) {
      console.error("Invalid date format:", date);
      return null;
    }

    return `${year}-${month}-${day}`;
  };

  const processExtractedJson = (openAiJson: any, propertyMappings: any, entityProperties: PropertyWithDetails[], onChange: any) => {
    if (!openAiJson) return;
    Object.entries(openAiJson).forEach(([key, value]) => {
      const mappedKey = Object.keys(propertyMappings).find((k) => propertyMappings[k] === key) || key;
      const property = entityProperties.find((p) => p.name === mappedKey);
      if (!property) return;
      const rowValue: any = {
        propertyId: property.id,
        property,
        textValue: property.type === PropertyType.TEXT ? value?.toString() : undefined,
        numberValue: property.type === PropertyType.NUMBER ? parseFloat(value as any) : undefined,
        dateValue: property.type === PropertyType.DATE ? validateDate(value as any) : undefined,
        booleanValue: property.type === PropertyType.BOOLEAN ? Boolean(value) : undefined,
        selectedOption: property.type === PropertyType.SELECT ? value?.toString() : undefined,
        multiple:
          property.type === PropertyType.MULTI_TEXT
            ? Array.isArray(value)
              ? value.map((v, index) => ({ value: v.toString(), id: "", order: index, rowValueId: "" }))
              : [{ value: [value].toString(), id: "", order: 0, rowValueId: "" }]
            : undefined,
        media: property.type === PropertyType.MEDIA ? [value] : undefined,
      };

      if (property.type === PropertyType.DATE && value) {
        const formattedDate = formatDate(value);
        if (formattedDate) {
          rowValue.dateValue = formattedDate;
        } else {
          rowValue.dateValue = null;
        }
      }
      onChange(rowValue);
    });
  };

  const parseResumeData = async (onChange: (values: RowValueDto) => void, media: any, item: any, entity: any, routes: any) => {
    setIsLoading(true);
    try {
      const validFile = await extractFileFromMedia(media);
      if (!validFile) return;
      const pdfToText = await loadPdfToText();
      const extractedText = await pdfToText(validFile);
      const openAiJson = await generateJsonFromContent(extractedText);
      processExtractedJson(openAiJson, propertyMappingsResume, entity.properties, onChange);

      const educationHistories = openAiJson.Education || [];
      const educationSlugEntityTenant = { slug: "education-history", onEdit: null };
      const allEducationTent = await entityListData(
        EntityHelper.getRoutes({ routes, entity: educationSlugEntityTenant })?.list +
          "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
      );

      if (!allEducationTent || !allEducationTent.rowsData || !allEducationTent.rowsData.views) {
        console.error("Invalid allEducation data structure");
      } else {
        const educationHistoryIds = await saveTenantEducationHistory(educationHistories, allEducationTent, tenantSlug);

        if (educationHistoryIds.length > 0) {
          for (const educationHistoryId of educationHistoryIds) {
            try {
              const educationRelationEntity = childrenEntities.visible.filter((f: any) => f.child.slug === "education-history");

              if (educationRelationEntity.length > 0) {
                const educationSlugEntity = { slug: "education-history", onEdit: null };
                const allEducation = await entityListData(
                  EntityHelper.getRoutes({ routes, entity: educationSlugEntity })?.list +
                    "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
                );

                if (!allEducation || !allEducation.rowsData || !allEducation.rowsData.items) {
                  throw new Error("Invalid education data format");
                }

                const selectEducation = allEducation.rowsData.items.filter((id: any) => id.id === educationHistoryId);

                if (selectEducation.length > 0) {
                  addDynamicRow(educationRelationEntity[0], selectEducation);
                }
              }
            } catch (error) {
              console.error("Error processing education history:", error);
            }
          }
        }
      }

      const workExperienceHistories = openAiJson.Employment || [];
      const workExperienceSlugEntityTenant = { slug: "work-experience", onEdit: null };
      const allWorkExperienceTent = await entityListData(
        EntityHelper.getRoutes({ routes, entity: workExperienceSlugEntityTenant })?.list +
          "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
      );

      if (!allWorkExperienceTent || !allWorkExperienceTent.rowsData || !allWorkExperienceTent.rowsData.views) {
        console.error("Invalid allWorkExperience data structure:", allWorkExperienceTent);
      } else {
        const workExperienceIds = await saveTenantWorkExperience(workExperienceHistories, allWorkExperienceTent, tenantSlug);

        if (workExperienceIds.length > 0) {
          for (const workExperienceId of workExperienceIds) {
            try {
              const workExperienceRelationEntity = childrenEntities.visible.filter((f: any) => f.child.slug === "work-experience");

              if (workExperienceRelationEntity.length > 0) {
                const workExperienceSlugEntity = { slug: "work-experience", onEdit: null };
                const allWorkExperience = await entityListData(
                  EntityHelper.getRoutes({ routes, entity: workExperienceSlugEntity })?.list +
                    "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
                );

                if (!allWorkExperience || !allWorkExperience.rowsData || !allWorkExperience.rowsData.items) {
                  throw new Error("Invalid employment data format");
                }

                const selectWorkExperience = allWorkExperience.rowsData.items.filter((id: any) => id.id === workExperienceId);

                addDynamicRow(workExperienceRelationEntity[0], selectWorkExperience);
              }
            } catch (error) {
              console.error("Error processing work experience:", error);
            }
          }
        }
      }

      const project = openAiJson.Projects || [];
      const projectSlugEntityTenant = { slug: "project", onEdit: null };
      const allProjectsTent = await entityListData(
        EntityHelper.getRoutes({ routes, entity: projectSlugEntityTenant })?.list +
          "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
      );

      if (!allProjectsTent || !allProjectsTent.rowsData || !allProjectsTent.rowsData.views) {
        console.error("Invalid allWorkExperience data structure:", allProjectsTent);
      } else {
        const projectIds = await saveTenantProjects(project, allProjectsTent, tenantSlug);

        if (projectIds.length > 0) {
          for (const projectId of projectIds) {
            try {
              const projectRelationEntity = childrenEntities.visible.filter((f: any) => f.child.slug === "project");

              if (projectRelationEntity.length > 0) {
                const projectSlugEntity = { slug: "project", onEdit: null };
                const allProjects = await entityListData(
                  EntityHelper.getRoutes({ routes, entity: projectSlugEntity })?.list +
                    "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
                );

                if (!allProjects || !allProjects.rowsData || !allProjects.rowsData.items) {
                  throw new Error("Invalid employment data format");
                }

                const selectProjects = allProjects.rowsData.items.filter((id: any) => id.id === projectId);

                addDynamicRow(projectRelationEntity[0], selectProjects);
              }
            } catch (error) {
              console.error("Error processing work experience:", error);
            } finally {
              setIsLoading(false);
            }
          }
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const parseJobData = async (onChange: (values: RowValueDto) => void, media: any, item: any, entity: any, JDUserInput?: any) => {
    setIsLoading(true);
    try {
      let openAiJson;
      if (media) {
        const validFile = await extractFileFromMedia(media);
        if (!validFile) return;
        const pdfToText = await loadPdfToText();
        const extractedText = await pdfToText(validFile);
        openAiJson = await generateJsonFromJD(extractedText, false);
      } else {
        if (!JDUserInput || !JDUserInput.length) {
          toast.error("Please enter Job Description to proceed");
          return; // Check if JDUserInput is not undefined or empty
        }

        openAiJson = await generateJsonFromJD(JDUserInput, true);
        if (openAiJson?.error) {
          toast.error(openAiJson.error);
          return;
        }
      }
      processExtractedJson(openAiJson, propertyMappings, entity.properties, onChange);
    } catch (error) {
      console.error("Error parsing job data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMediaFile = async (headers: any, onChange: any, media: any, item: any, entity: any, routes: any, JDUserInput?: any) => {
    if (!entity) {
      console.warn("Entity is undefined");
      return;
    }

    try {
      switch (entity.name) {
        case "Job":
          await parseJobData(onChange, media, item, entity, JDUserInput);
          break;
        case "Candidate":
          await parseResumeData(onChange, media, item, entity, routes);
          break;
        default:
          console.warn(`Unsupported entity type: ${entity.name}`);
      }
    } catch (error) {
      console.error("Error occurred while parsing media file:", error);
    }
  };

  return { parseMediaFile, isLoading, isAIAvailable };
};
