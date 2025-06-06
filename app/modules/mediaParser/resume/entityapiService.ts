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
      totalYears: education.totalYears || "",
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
      totalYearsExp: workExperience.totalYearsExp || "",
    }));
  
    return await saveTenantEntity("Work Experience", formattedWorkExperienceHistories, allWorkExperienceTent, tenantSlug);
  };

  export const saveTenantCertifications = async (certifications: any[], allCertificationsTent: any, tenantSlug: string|undefined|null) => {
    const formattedCertifications = certifications.map((certification) => ({
      name: certification.name || "",
      issuingOrganization: certification.issuingOrganization || "",
      expirationDate: certification.expirationDate || "",
    }));

    return await saveTenantEntity("Certifications", formattedCertifications, allCertificationsTent, tenantSlug);
  }

  export const saveTenantProjects = async (project: any[], allProjectsTent: any, tenantSlug: string | undefined | null) => {
    const formattedProjects = project.map((projects) => ({
      projectName: projects.projectName || "",
      technologiesUsed: Array.isArray(projects.technologiesUsed) ? projects.technologiesUsed : [],
      from: projects.from || "",
      to: projects.to || "",
      summary: projects.summary || "",
  }));
  
    return await saveTenantEntity("Project", formattedProjects, allProjectsTent, tenantSlug);
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
  