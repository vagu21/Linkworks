import { useState } from "react";
import { entityListData, saveTenantEducationHistory, saveTenantTechnicalSkills, saveTenantWorkExperience } from "./resume/entityapiService";
import { generateJsonFromContent } from "./resume/resumeBot";
import { generateJsonFromJD } from "./job/jobBot";
import EntityHelper from "~/utils/helpers/EntityHelper";
import { EntityRelationshipWithDetails } from "~/utils/db/entities/entityRelationships.db.server";
import { RowWithDetails } from "~/utils/db/entities/rows.db.server";
import { PropertyWithDetails } from "~/utils/db/entities/entities.db.server";
import { RowValueDto } from "~/application/dtos/entities/RowValueDto";
import { useParams } from "@remix-run/react";

type ProcessCandidateArgs = {
  addDynamicRow: (relationship: EntityRelationshipWithDetails, rows: RowWithDetails[]) => void;
  childrenEntities: { visible: EntityRelationshipWithDetails[]; hidden: EntityRelationshipWithDetails[] };
};

const propertyMappings = {
  description: "Description",
  title: "Title",
  status: "Status",
  numberOfOpenings: "No of openings",
  type: "Job-Type",
  remote: "Remote",
  experience: "Experience",
  salaryType: "Salary-Type",
  salary: "Salary",
  category: "JobCategory",
  skills: "Skills",
  experienceLevel: "Experience-Level",
  postedDate: "Posted Date",
  applicationDeadline: "Job Deadline",
  targetHiringDate: "Target Hiring Date",
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
};

export const useProcessMediaFile = ({ addDynamicRow = () => {}, childrenEntities = { visible: [], hidden: [] } }: ProcessCandidateArgs) => {
  const [isLoading, setIsLoading] = useState(false);
  const params = useParams();
  const tenantSlug = params.tenant;

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

  const processExtractedJson = (openAiJson: any, propertyMappings: any, entityProperties: PropertyWithDetails[], onChange: any) => {
    if (!openAiJson) return;
    Object.entries(openAiJson).forEach(([key, value]) => {
      const mappedKey = Object.keys(propertyMappings).find((k) => propertyMappings[k] === key) || key;
      const property = entityProperties.find((p) => p.name === mappedKey);
      if (!property) return;

      const rowValue = {
        propertyId: property.id,
        property,
        textValue: property.type === 1 ? value?.toString() : undefined,
        numberValue: property.type === 0 ? parseFloat(value as any) : undefined,
        dateValue: property.type === 2 ? validateDate(value as any) : undefined,
        booleanValue: property.type === 10 ? Boolean(value) : undefined,
        selectedOption: property.type === 8 ? value?.toString() : undefined,
        multiple:
          property.type === 12
            ? Array.isArray(value)
              ? value.map((v, index) => ({ value: v.toString(), id: "", order: index, rowValueId: "" }))
              : [{ value: [value].toString(), id: "", order: 0, rowValueId: "" }]
            : undefined,
        media: property.type === 6 ? [value] : undefined,
      };
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

      const technicalSkills = openAiJson.Skills || [];
      const technicalSkillsSlugEntityTenant = { slug: "skills", onEdit: null };
      const allTechnicalSkillsTent = await entityListData(
        EntityHelper.getRoutes({ routes, entity: technicalSkillsSlugEntityTenant })?.list +
          "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
      );

      if (!allTechnicalSkillsTent || !allTechnicalSkillsTent.rowsData || !allTechnicalSkillsTent.rowsData.views) {
        console.error("Invalid allWorkExperience data structure:", allTechnicalSkillsTent);
      } else {
        const technicalSkillsIds = await saveTenantTechnicalSkills(technicalSkills, allTechnicalSkillsTent, tenantSlug);

        if (technicalSkillsIds.length > 0) {
          for (const technicalSkillsId of technicalSkillsIds) {
            try {
              const technicalSkillsRelationEntity = childrenEntities.visible.filter((f: any) => f.child.slug === "skills");

              if (technicalSkillsRelationEntity.length > 0) {
                const technicalSkillsSlugEntity = { slug: "skills", onEdit: null };
                const allTechnicalSkills = await entityListData(
                  EntityHelper.getRoutes({ routes, entity: technicalSkillsSlugEntity })?.list +
                    "?view=null?&_data=routes/app.$tenant/g.$group/$entity.__autogenerated/__$entity"
                );

                if (!allTechnicalSkills || !allTechnicalSkills.rowsData || !allTechnicalSkills.rowsData.items) {
                  throw new Error("Invalid employment data format");
                }

                const selectTechnicalSkills = allTechnicalSkills.rowsData.items.filter((id: any) => id.id === technicalSkillsId);

                addDynamicRow(technicalSkillsRelationEntity[0], selectTechnicalSkills);
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

  const parseJobData = async (onChange: (values: RowValueDto) => void, media: any, item: any, entity: any) => {
    setIsLoading(true);
    try {
      const validFile = await extractFileFromMedia(media);
      if (!validFile) return;
      const pdfToText = await loadPdfToText();
      const extractedText = await pdfToText(validFile);
      const openAiJson = await generateJsonFromJD(extractedText);
      processExtractedJson(openAiJson, propertyMappings, entity.properties, onChange);
    } catch (error) {
      console.error("Error parsing job data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const parseMediaFile = async (headers: any, onChange: any, media: any, item: any, entity: any, routes: any) => {
    if (!entity) {
      console.warn("Entity is undefined");
      return;
    }

    try {
      switch (entity.name) {
        case "Job":
          await parseJobData(onChange, media, item, entity);
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

  return { parseMediaFile, isLoading };
};
