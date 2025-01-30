export async function generateJsonFromJD(extractedText: string) {
  const prompt = `
Summarize the job description below into a JSON with exactly the following structure{
            "Description" (it should be a brief description of the job experience, skills, and expertise in string format, cannot be empty): "",
            "Title" (it should be a name of position in string format, cannot be empty):"",
            "Status" (it should be a valid status which should be either "Open" or "Closed" or "Filled" in string format, cannot be empty): "",
            "No of openings" (it should be a valid number of openings for the job in number format, cannot be empty): "",
            "Location"(it should be a location of candidate in string format, leave an empty string if not found):"",
            "Experience" (it should be a number of experience,cannot be empty): "",
            "Salary" (it should be a amount of salary,cannot be empty): "",
            "JobCategory" (it should be the name of category in which the job belongs, leave an empty string if not found): "",
            "Experience-Level" (it should be a valid experience level which should be either "Entry-Level" or "Mid-Level" or "Senior-Level" in string format, cannot be empty): "",
            "Job-Type" (it should be a valid job type which should be either "Part-Time" or "Full-Time" or "Contract" or "Contract to Permanent" in string format, cannot be empty): "",
            "Salary-Type" (it should be a valid salary type which should be either "Annual" or "Monthly" or "Weekly" or "Daily" or "Hourly" in string format, cannot be empty): "",
            "Currency-Type" (it should be a valid currency which should be either "INR" or "USD" or "ZAR"  in string format, leave others if not found): "",
            "Educational-Qualification" (it should be a valid education qualification which should be either "High School Dropout" or "High School Diploma" or "Associate Degree" or "Bachelor's Degree" or "Master's Degree" or "Doctorate"  in string format, leave others if not found): "",
            "Educational-Specialization" (it should be a valid specialization of education, leave an empty string if not found): "",
            "Remote" (it should be a boolean type value which should be either "True" or "False" check for workarrangement or some field if its inoffice its true if its showing remote then return false in string format, cannot be empty): "",
            "Target Hiring Date" (it should be a valid date in "dd-mm-yyyy" format, leave an empty string if not found): "",
            "Posted Date" (it should be a valid date in "dd-mm-yyyy" format, leave an empty string if not found): "",
            "Job Deadline" (it should be a valid date in "dd-mm-yyyy" format, leave an empty string if not found): "",
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
  return response;
}
