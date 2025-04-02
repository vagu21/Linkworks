

export async function generateJsonFromContent(extractedText: string) {
  const prompt = `
Summarize the candidate details below into a JSON with exactly the following structure{
            "FirstName" (it should be a first name of candidate in string format, cannot be empty):"",
            "LastName" (it should be a last name of candidate in string format, cannot be empty):"",
            "Summary" (it should be a brief summary of the candidate's experience, skills, and expertise in string format, cannot be empty): "",
            "Email" (it should be a valid email address in string format, cannot be empty): "",
            "Phone_Number": "+[CountryCode][ValidPhoneNumber]" (It should be a valid phone number in string format, including the country code if provided. If the country code is missing, infer it based on the phone number format and ensure it is valid. The field cannot be empty.)
            "Date_of_Birth" (it should be a valid date of birth in 'YYYY-MM-DD' format, can be empty if not found): "",
            "AdhaarNumber" (it should be a valid Adhaar number in string format, can be empty if not found): "",
            "LinkedInProfileURL" (if a valid LinkedIn URL is found, return it as is. If only a name like '[Candidate Name]'s LinkedIn Profile' is found, extract '[Candidate Name]', convert it into lowercase, replace spaces with hyphens, and format it into a valid LinkedIn URL like 'https://www.linkedin.com/in/[candidate-name]/'. If no LinkedIn details are found, return an empty string): "",
            "facebookProfileUrl" (it should be a valid Facebook profile URL in string format, can be empty if not found): "",
            "twitterProfileUrl" (it should be a valid Twitter profile URL in string format, can be empty if not found): "",
            "githubProfileUrl" (it should be a valid GitHub profile URL in string format, can be empty if not found): "",
            "xingProfileUrl" (it should be a valid Xing profile URL in string format, can be empty if not found): "",
            "reference" (it should only contain the name of the person who provided the reference, in string format, can be empty if not found): "",
            "status" (it should be a single select value from ["Proposed", "Interviewing", "Selected", "Hold", "Rejected", "Cancelled", "Banned"]. If not found, it should be empty): "",
            "currentDesignation" (it should be the candidate's current job title/designation in string format, can be empty if not found): "",
            "totalExperienceInYears" (it should be the candidate's total work experience in decimal format. If not found, it should be empty): 0.0,
            "panNumber" (it should be a valid PAN number in string format, can be empty if not found): "",
            "availability" (it should be a single select value from ["Open to work", "Hired", "Off-Limits"]. If not found, it should be empty): "",
            "universalAccountNumberUan" (it should be a valid Universal Account Number (UAN) in string format, can be empty if not found): "",
            "willingToRelocate" (it should be a single select value from ["Yes", "No"]. If not found, it should be empty): "",
            "pfNumber" (it should be a valid Provident Fund (PF) number in string format, can be empty if not found): "",
            "CandidateSkills": ["A list of skills suitable for the job description and present in it. Maximum of N items. Cannot be empty."]
            "noticePeriod" (it should be a single select value from ["15 Days", "30 Days", "60 Days", ">120 Days"]. If not found, it should be empty): "",
            "currentLocation" (it should be the current location of the candidate, cannot be empty): "",
            "portfolioLink" (it should be a valid portfolio URL in string format, can be empty if not found): "",
            "otherProfileUrl" (it should be a valid URL from the available options: Facebook, Twitter, GitHub, Xing. Only one URL can be chosen. If none of these are found, return an empty string): "",
            "referenceId" (it should be a reference ID, can be empty if not found): "",
            "referenceEmail" (it should be a valid email address of the reference person, can be empty if not found): "",
            "Education": [
    {
      "schoolCollegeName": "The name of the school, college, or university attended by the candidate, written as a single string.",
      "educationQualification": "The qualification attained by the candidate, such as 'B.Tech', 'Intermediate Education', 'MBA', written as a string.",
      "educationalSpecialization": "The field of study or specialization, such as 'Computer Science Engineering' or 'Marketing', written as a string. should not be more long 4-5 words as maximum",
      "grade": "The grade or percentage attained by the candidate, such as 'CGPA: 6.44' or 'Percentage: 78.5%', written as a string.",
      "location": "The location of the institution, such as 'Hyderabad', written as a string. If not available, leave this as an empty string.",
      "startDate": "The start date of the education period in 'YYYY-MM-DD' format. If not available, leave this as an empty string.",
      "endDate": "The end date of the education period in 'YYYY-MM-DD' format. If not available, leave this as an empty string.",
      "description": "Additional details about the education, such as achievements, internships, or notable activities, written as a string. If not available, leave this as an empty string.",
      "totalYears": "The total duration of education in years, calculated as the difference between endDate and startDate. If either date is missing or invalid, leave this as 0."

    }
  ]       
  "Employment": [
    {
      "title": "The job title held by the candidate, written as a string.",
      "companyName": "The name of the company or organization where the candidate worked, written as a string.",
      "employmentType": "One of the following: 'Part Time', 'Full Time', 'Contract', 'Self-employed', 'Internship', 'Apprenticeship', 'Freelance'. Leave as an empty string if no match is found.",
      "industryType": "One of the following: 'Banking and Finance', 'Consulting', 'Education and E-Learning', 'Healthcare and Pharmaceuticals', 'Computer and Network Security'. Leave as an empty string if no match is found.",
      "location": "The location of the job. Leave as an empty string if not found.",
      "salary": "The salary associated with the job as a number. Leave as 0 if not found.",
      "currentlyWorkingInThisRole": "A boolean indicating whether the candidate is currently working in this role.",
      "startDate": "The start date of the job period in 'YYYY-MM-DD' format. Leave as an empty string if not found.",
      "endDate": "The end date of the job period in 'YYYY-MM-DD' format. Leave as an empty string if not found.",
      "description": "Additional details about the job role, responsibilities, or notable achievements, written as a string. If not available, leave this as an empty string.",
      "totalYearsExp": "The total duration of employment in years, calculated as the difference between endDate and startDate. If currentlyWorkingInThisRole is true, use the current date as endDate. If either date is missing or invalid, leave this as 0."
    }
    }
  ],

  "Projects": [
    {
      "projectName": "The title of the project or projectName, by the candidate written as a string.",
      "technologiesUsed": ["A list of technologies relevant to the project and used in it. Maximum of N items. Cannot be empty."],
      "from": "The start date of the project in 'YYYY-MM-DD' format. If not available, leave this as an empty string.",
      "to": "The end date of the project in 'YYYY-MM-DD' format. If not available, leave this as an empty string.
      "summary": "A brief description of the project, including objectives, features, or impact, written as a string. If not available, leave this as an empty string."
    }
  ]


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

const serverUrl=import.meta.env.VITE_PUBLIC_SERVER_URL
const data = await fetch(`${serverUrl}/api/open-AI`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({ prompt })
  })


  const response=await data.json();
  return response;

}
