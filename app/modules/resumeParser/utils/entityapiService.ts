const apiKey: string | undefined = import.meta.env.VITE_CLIENT_API_KEY;
export const saveEducationHistory = async (education: any) => {
  try {
    const response = await fetch("http://works.lfiapps.com/api/education-history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-Api-key": `${apiKey}`,
      },
      body: JSON.stringify(education),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const saveWorkExperience = async (workExperienceEntity : any) => {
  try {
    const response = await fetch("http://works.lfiapps.com/api/work-experience", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-Api-key": `${apiKey}`,
      },
      body: JSON.stringify(workExperienceEntity),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const entityListData = async ( entityUrl: string) => {
  try {
    const response = await fetch(
      "http://works.lfiapps.com"+entityUrl
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch entity data: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    
    return null;
  }
};
