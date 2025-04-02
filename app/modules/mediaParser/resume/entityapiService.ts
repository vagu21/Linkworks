const serverUrl = import.meta.env.VITE_PUBLIC_SERVER_URL;


export const saveTenantEntity = async (
    entityName: string,
    entityDataList: any[],
    tenantData: any,
    tenantSlug: any, 
  ): Promise<string[]> => {
    const entityIds: string[] = [];
    if (!tenantSlug) {
      return entityIds;
    }
    const tenant =  tenantSlug; 
    for (const entityData of entityDataList) {
      const formData = new FormData();
      formData.append("entityName", entityName);
      formData.append("entityData", JSON.stringify(entityData));
      formData.append("tenant", JSON.stringify(tenant));
  
      try {
        const response = await fetch(`${serverUrl}/api/media-parser/${entityName}`, {
          method: "POST",
          body: formData,
          credentials:"include",
        });
  
        if (!response.ok) {
          continue;
        }
  
        const data = await response.json();
        if (data?.item?.id) {
          entityIds.push(data.item.id);
        } else {
          console.error(`Invalid response format for ${entityName}: ${JSON.stringify(data)}`);
        }
      } catch (error) {
        console.error(`Error saving ${entityName}:`, error);
      }
    }
  
    return entityIds;
  };
  
  export const saveTenantEducationHistory = async (educationHistories: any[], allEducationTent: any, tenantSlug: string|undefined|null) => {
    const formattedEducationHistories = educationHistories.map((education) => ({
      schoolCollegeName: education.schoolCollegeName || "",
      educationQualification: education.educationQualification || "",
      educationalSpecialization: education.educationalSpecialization || "",
      grade: education.grade || "",
      location: education.location || "",
      startDate: education.startDate || "",
      endDate: education.endDate || "",
      description: education.description || "",
    }));
  
    return await saveTenantEntity("Education History", formattedEducationHistories, allEducationTent, tenantSlug);
  };
  
  export const saveTenantWorkExperience = async (workExperienceHistories: any[], allWorkExperienceTent: any,  tenantSlug: string|undefined|null) => {
    const formattedWorkExperienceHistories = workExperienceHistories.map((workExperience) => ({
      title: workExperience.title || "",
      companyName: workExperience.companyName || "",
      employmentType: workExperience.employmentType || "",
      industryType: workExperience.industryType || "",
      location: workExperience.location || "",
      salary: typeof workExperience.salary === "number" ? workExperience.salary : 0,
      currentlyWorkingInThisRole: workExperience.currentlyWorkingInThisRole || false,
      startDate: workExperience.startDate || "",
      endDate: workExperience.endDate || "",
      description: workExperience.description || "",
    }));
  
    return await saveTenantEntity("Work Experience", formattedWorkExperienceHistories, allWorkExperienceTent, tenantSlug);
  };


  export const saveTenantTechnicalSkills = async (technicalSkills: any[], allTechnicalSkillsTent: any,  tenantSlug: string|undefined|null) => {
    const formattedTechnicalSkills = technicalSkills.map((Skill) => ({
      name: Skill.name || "",
      proficiency: typeof Skill.proficiency === "number" ? Skill.proficiency : 0,
      
    }));
  
    return await saveTenantEntity("Skills", formattedTechnicalSkills, allTechnicalSkillsTent, tenantSlug);
  };
  
  export const entityListData = async (entityUrl: string) => {
    try {
      const response = await fetch(`${serverUrl}` + entityUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch entity data: ${response.status}`);
      }
      const jsonResponse = await response.json();
      return jsonResponse;
    } catch (error) {
      return null;
    }
  };
  