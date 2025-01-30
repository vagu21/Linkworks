

export async function generateJsonFromContent(extractedText: string) {
  const prompt = `
Summarize the candidate details below into a JSON with exactly the following structure{
            "Summary" (it should be a brief summary of the candidate's experience, skills, and expertise in string format, cannot be empty): "",
            "FirstName" (it should be a first name of candidate in string format, cannot be empty):"",
            "LastName" (it should be a last name of candidate in string format, cannot be empty):"",
            "Email" (it should be a valid email address in string format, cannot be empty): "",
            "Phone_Number" (it should be a valid phone number in string format, cannot be empty): "",
            "Location"(it should be a location of candidate in string format, leave an empty string if not found):"",
            "LanguageSkills" (it should list the languages the candidate is proficient in, separated by commas, leave an empty string if not found): "",
            "Skills": ["A list of skills suitable for the job role. Maximum of 10 items. Cannot be empty."],
            "LinkedInProfileURL" (it should be a valid LinkedIn URL in string format, cannot be empty): "",
            "Date of Birth" (it should be a valid date of birth in 'YYYY-MM-DD' format, can be empty if not found): "",

            
            "Education": [
    {
      "schoolCollegeName": "The name of the school, college, or university attended by the candidate, written as a single string.",
      "educationQualification": "The qualification attained by the candidate, such as 'B.Tech', 'Intermediate Education', 'MBA', written as a string.",
      "educationalSpecialization": "The field of study or specialization, such as 'Computer Science Engineering' or 'Marketing', written as a string. should not be more long 4-5 words as maximum",
      "grade": "The grade or percentage attained by the candidate, such as 'CGPA: 6.44' or 'Percentage: 78.5%', written as a string.",
      "location": "The location of the institution, such as 'Hyderabad', written as a string. If not available, leave this as an empty string.",
      "startDate": "The start date of the education period in 'YYYY-MM-DD' format. If not available, leave this as an empty string.",
      "endDate": "The end date of the education period in 'YYYY-MM-DD' format. If not available, leave this as an empty string.",
      "description": "Additional details about the education, such as achievements, internships, or notable activities, written as a string. If not available, leave this as an empty string."
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
      "description": "Additional details about the job role, responsibilities, or notable achievements, written as a string. If not available, leave this as an empty string."
    }
  ],

 "Skills": [
                {
                    "name": "The name of the skill  by the candidate, written as a string.",
                    "proficiency": "The proficiency level of the skill as a number between 1-5, calculated based on employment or resume details."
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
