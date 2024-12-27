const apiKey: string | undefined = import.meta.env.VITE_API_KEY;

export const saveEmploymentInformation = async (employment : any) => {
  try {
    const response = await fetch("http://works.lfiapps.com/api/work-experience", {

      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-Api-key": apiKey,
      },
      body: JSON.stringify(employment),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};


  export const saveCandidateEntity = async (candidate :any) => {
    try {
      const response = await fetch("http://works.lfiapps.com/api/candidates", {
  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-Api-key": apiKey,
        },
        body: JSON.stringify(candidate),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  };
  
  export const saveRelationship = async (relationship : any) => {
    try {
      const response = await fetch("http://works.lfiapps.com/api/relationships", {
  
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-Api-key": apiKey, 

        },
        body: JSON.stringify(relationship),
      });
      return await response.json();
    } catch (error) {
      return null;
    }
  };

  export const updateCandidateEntity = async (candidateId: string, updatedCandidateData: any) => {
    try {
        const response = await fetch(`http://works.lfiapps.com/api/candidates/${candidateId}`, {
        
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "x-Api-key": apiKey,
            },
            body: JSON.stringify(updatedCandidateData),
        });
        return await response.json();
    } catch (error) {
        return null;
    }
};

export const saveEducationHistory = async (education: any) => {
  try {
    const response = await fetch("http://works.lfiapps.com/api/education-history", {
    
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-Api-key": apiKey,
      },
      body: JSON.stringify(education),
    });
    return await response.json();
  } catch (error) {
    return null;
  }
};
