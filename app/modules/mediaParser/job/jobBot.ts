export async function generateJsonFromJD(extractedText: string, isUserPrompt: boolean) {

  let prompt = ``;
  switch (isUserPrompt) {

    case false:
      prompt = `
Summarize the job description below into a JSON with exactly the following structure{
            "Description" (it should be a full description of the job experience, skills, key responsibilities, educational qualification, professional experiece required, and expertise in string format it should be descriptive not brief, cannot be empty): "",
            "Title" (it should be a name of position in string format, cannot be empty):"",
            "Status" (it should be a valid status which should be either "Open" or "Closed" or "Filled" in string format, cannot be empty): "",
            "No of openings" (it should be a valid number of openings for the job in number format, cannot be empty): "",
            "Location"(it should be a location of candidate in string format, leave an empty string if not found):"",
            "Experience" (it should be a number of experience,cannot be empty): "",
            "Salary": (It should be an amount of salary and cannot be empty. Enter the salary as a number, even if it is given in words.): "",
            "JobCategory" (it should be the name of category in which the job belongs to search over web for the job category with job title, cannot be empty: "",
            "Experience-Level" (it should be a valid experience level which should be either "Entry-Level (0-2 years)" or "Mid-Level (2-5 years)" or "Senior-Level (5-10 years)" in string format, cannot be empty): "",
            "Job-Type" (it should be a valid job type which should be either "Part-Time" or "Full-Time" or "Contract" or "Contract to Permanent" in string format, cannot be empty): "",
            "Salary-Type" (it should be a valid salary type which should be either "Annual" or "Monthly" or "Weekly" or "Daily" or "Hourly" in string format, cannot be empty): "",
            "Currency-Type" (it should be a valid currency which should be either "INR" or "USD" or "ZAR"  in string format, leave others if not found): "",
            "Educational-Qualification" (it should be a valid education qualification which should be either "High School Dropout" or "High School Diploma" or "Associate Degree" or "Bachelor's Degree" or "Master's Degree" or "Doctorate"  in string format, leave others if not found): "",
            "Educational-Specialization": "(The specialization of the educational qualification (e.g., Computer Science, Engineering, etc.). If not explicitly mentioned, can not be empty.)",
            "Remote" (it should be a boolean type value which should be either "True" or "False" check for workarrangement or some field if its inoffice its true if its showing remote then return false in string format, cannot be empty): "",
            "Target-Hiring-Date": (it should be a valid date in 'dd-mm-yyyy' format. If mentioned, enter the target hiring date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found): "",
            "Posted-Date": (It should be a valid date in 'dd-mm-yyyy' format. If mentioned, enter the posted date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found.): "",
            "Job-Deadline": (It should be a valid date in 'dd-mm-yyyy' format.If mentioned, enter the Job deadline date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found.): "",
            "Skills": ["A list of skills suitable for the job description and present in it. Maximum of 10 items. Cannot be empty."]
            "Location": (it should be a location, cannot be empty): "",
}
The JSON must be valid and enclosed in a proper code block, like this:
\`\`\`json
{
  "key": "value"
}
\`\`\`
Do not include any extra text or explanations outside the JSON object.          
Candidate Details: 

${extractedText}
`;
    case true:
      prompt = `
Summarize the job description below into a JSON with exactly the following structure{
            "Description" (it should be a full description of the job experience, skills, key responsibilities, educational qualification, professional experiece required, and expertise in string format it should be descriptive not brief, if not provdied keep it empty): "",
            "Title" (it should be a name of position in string format, if not provided keep it empty):"",
            "Status" (it should be a valid status which should be either "Open" or "Closed" or "Filled" in string format, if not provided keep it empty): "",
            "No of openings" (it should be a valid number of openings for the job in number format, if not provided keep it empty): "",
            "Location"(it should be a location of candidate in string format, leave an empty string if not found):"",
            "Experience" (it should be a number of experience,if not provided keep it empty): "",
            "Salary": (It should be an amount of salary and cannot be empty. Enter the salary as a number, even if it is given in words.): "",            
            "JobCategory" (it should be the name of category in which the job belongs to search over web for the job category with job title, if not provided keep it empty: "",
            "Experience-Level" (it should be a valid experience level which should be either "Entry-Level (0-2 years)" or "Mid-Level (2-5 years)" or "Senior-Level (5-10 years)" in string format, if not provided keep it empty): "",
            "Job-Type" (it should be a valid job type which should be either "Part-Time" or "Full-Time" or "Contract" or "Contract to Permanent" in string format, if not provided keep it empty): "",
            "Salary-Type" (it should be a valid salary type which should be either "Annual" or "Monthly" or "Weekly" or "Daily" or "Hourly" in string format, if not provided keep it empty): "",
            "Currency-Type" (it should be a valid currency which should be either "INR" or "USD" or "ZAR"  in string format, if not provided keep it empty): "",
            "Educational-Qualification" (it should be a valid education qualification which should be either "High School Dropout" or "High School Diploma" or "Associate Degree" or "Bachelor's Degree" or "Master's Degree" or "Doctorate"  in string format, if not provided keep it empty): "",
            "Educational-Specialization": "(The specialization of the educational qualification (e.g., Computer Science, Engineering, etc.). If not explicitly mentioned, if not provided keep it empty)",
            "Remote" (it should be a boolean type value which should be either "True" or "False" check for workarrangement or some field if its inoffice its true if its showing remote then return false in string format, if not provided keep it empty): "",
            "Target-Hiring-Date": (it should be a valid date in 'dd-mm-yyyy' format. If mentioned, enter the target hiring date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found): "",
            "Posted-Date": (It should be a valid date in 'dd-mm-yyyy' format. If mentioned, enter the posted date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found.): "",
            "Job-Deadline": (It should be a valid date in 'dd-mm-yyyy' format.If mentioned, enter the Job deadline date. If not mentioned, decide based on context and provide an appropriate date. Leave an empty string if not found.): "",
            "Skills": ["A list of skills suitable for the job description and present in it. Maximum of 10 items. Cannot be empty."]
            "Location": (it should be a location, cannot be empty): "",
}
The JSON must be valid and enclosed in a proper code block, like this:
\`\`\`json
{
  "key": "value"
}
\`\`\`
Do not include any extra text or explanations outside the JSON object.          
Job Details: 

${extractedText}
`;
  }


  const serverUrl = import.meta.env.VITE_PUBLIC_SERVER_URL
  const data = await fetch(`${serverUrl}/api/open-AI`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ prompt })
  })


  const response = await data.json();

  if (isUserPrompt) {
    let validKeysCount = 0;

    for (let key in response) {
      if (response[key] !== "" && (Array.isArray(response[key]) ? response[key].length > 0 : true)) {
        validKeysCount++;
      }
    }
    if (validKeysCount <= 2) {
      return { error: `It looks like you've only provided information for few fields. Provide more details to proceed` };
    }

  }

  return response;
}
