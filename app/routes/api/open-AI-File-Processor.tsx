/*
 * New file parser API
 * Uses OpenAI's assistants (currently in beta), threads, files API
 * */
import { ActionFunction, json } from "@remix-run/node";
import OpenAI from "openai";
import path, { format } from "path";
import fs from "fs";
import properties from "../admin/entities/$entity/properties";
import { ca } from "date-fns/locale";

interface File {
    path: string; // Local file path
    type: string; // MIME type (e.g., "application/pdf", "image/png")
    name: string; // Original file name
    size: number; // File size in bytes
}

export const action: ActionFunction = async ({ request }) => {
    try {
        const openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY,
            dangerouslyAllowBrowser: true,
        });
        const formData = await request.formData();
        const file = formData.get("file");
        const isImage = file.type.startsWith("image/");

        const entity = formData.get("entity");

        if (!file) {
            throw new Error("No file uploaded");
        }

        let Schema;

        switch (entity) {
            case "Job":
                Schema = {
                    type: "object",
                    properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        numberOfOpenings: { type: "number" },
                        type: { type: "string" },
                        location: { type: "string" },
                        category: { type: "string" },
                        experienceLevel: {
                            type: "string",
                            enum: [
                                "Entry-Level (0-2 years)",
                                "Mid-Level(2-5 years)",
                                "Senior-Level (5-10 years)",
                                "Leadership-Level(10+ years)",
                            ],
                        },
                        remote: { type: "boolean" },
                        targetHiringDate: { type: "string", format: "date-time" },
                        salaryType: {
                            type: "string",
                            enum: ["Annual", "Monthly", "Weekly", "Daily", "Hourly"],
                        },
                        currency: {
                            type: "string",
                            enum: ["INR", "ZAR", "USD", "Others"],
                        },
                        status: { type: "string" },
                        educationalQualification: {
                            type: "string",
                            enum: [
                                "Master's Degree",
                                "Bachelor's Degree",
                                "Associate Degree",
                                "High School Diploma",
                                "High School Dropout",
                                "Not Available",
                            ],
                        },
                        educationalSpecialization: { type: "string" },
                        skills: { type: "array", items: { type: "string" } },
                        postedDate: { type: "string", format: "date-time" },
                        applicationDeadline: { type: "string", format: "date-time" },
                        salary: { type: "number" },
                    },
                };
                break;
            case "Candidate":
                Schema = {
                    type: "object",
                    properties: {
                        FirstName: { type: "string" },
                        LastName: { type: "string" },
                        Email: { type: "string" },
                        Phone_Number: {
                            type: "string",
                            rule: "Give phone number with country code. Apply country code if not present according to the number",
                        },
                        LinkedInProfileURL: { type: "string" },
                        githubProfileUrl: { type: "string" },
                        xingProfileUrl: { type: "string" },
                        reference: { type: "string" },
                        status: { type: "string" },
                        currentDesignation: {
                            type: "string",
                            rule: "Leave Empty if not found",
                        },
                        panNumber: { type: "string" },
                        availability: {
                            type: "string",
                            enum: ["Open to work", "Hired", "Off Limits"],
                            rule: "If not found keep it an empty string",
                        },
                        noticePeriod: {
                            type: "string",
                            enum: ["15 Days", "30 Days", "60 Days", ">120 Days"],
                            rule: "If not found keep it an empty string",
                        },
                        currentLocation: { type: "string" },
                        universalAccountNumberUan: { type: "string" },
                        willingToRelocate: {
                            type: "string",
                            enum: ["Yes", "No"],
                            rule: "If not found keep it an empty string",
                        },
                        pfNumber: { type: "string" },
                        Date_of_Birth: { type: "string", format: "date-time" },
                        AdhaarNumber: { type: "string" },
                        portfolioLink: { type: "string" },
                        otherProfileUrl: { type: "string" },
                        referenceId: { type: "string" },
                        referenceEmail: { type: "string" },
                        address: { type: "string" },
                        Summary: {
                            type: "string",
                            rule: "If not found prepare one with maximum of 1000 characters using information from resume ",
                        },
                        Education: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    schoolCollegeName: { type: "string" },
                                    educationQualification: { type: "string" },
                                    educationalSpecialization: { type: "string" },
                                    grade: { type: "string" },
                                    location: { type: "string" },
                                    startDate: { type: "string" },
                                    endDate: { type: "string" },
                                    description: { type: "string" },
                                    totalYears: { type: "number" },
                                },
                                required: [
                                    "schoolCollegeName",
                                    "educationQualification",
                                    "educationalSpecialization",
                                    "startDate",
                                    "endDate",
                                ],
                                additionalProperties: false,
                            },
                        },
                        Employment: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    companyName: { type: "string" },
                                    title: { type: "string" },
                                    employmentType: { type: "string" },
                                    industryType: { type: "string" },
                                    location: { type: "string" },
                                    salary: { type: "number" },
                                    currentlyWorkingInThisRole: { type: "boolean" },
                                    startDate: { type: "string" },
                                    endDate: {
                                        type: "string",
                                        rule: "If this employment is current employment then keep endDate empty string",
                                        format: "date-time",
                                    },
                                    description: {
                                        type: "string",
                                        rule: "The length of Description must be less than 500 characters.",
                                    },
                                    totalYearsExp: {
                                        type: "number",
                                        rule: "Calculate employment duration in years using start and end dates, defaulting to today's date if missing or invalid, and using today's date as end date if currently working in this role.",
                                    },
                                },
                                required: ["companyName", "title", "startDate"],
                                additionalProperties: false,
                            },
                        },
                        CandidateSkills: {
                            type: "array",
                            items: { type: "string" },
                        },
                        certifications: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    issuingOrganization: { type: "string" },
                                    expirationDate: {
                                        type: "string",
                                        format: "date-time",
                                        rule: "Do not give a string like Present, leave empty if not found or present is found",
                                    },
                                },
                                required: ["name"],
                                additionalProperties: false,
                            },
                        },
                        Projects: {
                            type: "array",
                            items: {
                                type: "object",
                                properties: {
                                    projectName: { type: "string" },
                                    summary: { type: "string" },
                                    technologiesUsed: {
                                        type: "array",
                                        items: { type: "string" },
                                    },
                                    from: {
                                        type: "string",
                                        rule: "Do not give a string like Present, leave empty if not found or present is found",
                                    },
                                    to: {
                                        type: "string",
                                        rule: "Do not give a string like Present, leave empty if not found or present is found",
                                    },
                                },
                                required: ["projectName", "summary"],
                                additionalProperties: false,
                            },
                        },
                        languages: {
                            type: "array",
                            items: { type: "string" },
                        },
                    },
                    required: [
                        "firstName",
                        "lastName",
                        "email",
                        "phoneNumber",
                        "education",
                        "experience",
                        "skills",
                    ],
                    additionalProperties: false,
                };

                break;

            case "Account":
                Schema = {
                    type: "object",
                    properties: {
                        SupplierorCompany: {
                            type: "string",
                            enum: ["Supplier", "Company"],
                        },
                        CompanyName: { type: "string" },
                        CompanyWebiste: { type: "string" },
                        Industry: {
                            type: "string",
                            enum: [
                                "IT Services and IT Consulting",
                                "Software Development",
                                "Financial Services",
                                "Technology",
                                "Information and Internet",
                                "Staffing and Recruiting",
                                "Information Technology & Services",
                                "Banking",
                                "Business Consulting and Services",
                                "Accounting",
                                "Information Services",
                            ],
                        },
                        Location: { type: "string" },
                        About: { type: "string", rule: "Maximum 500 characters" },
                        CompanySize: {
                            type: "string",
                            enum: [
                                "1-50 employees",
                                "51-200 employees",
                                "201-500 employees",
                                "501-1000 employees",
                                "1001-5000 employees",
                                "5001-10000 employees",
                                "10000+employees",
                            ],
                            rule: "If company size is greater than 10000 return 10000+employees",
                        },
                        FoundingYear: { type: "number" },
                        Keywords: { type: "array", items: { type: "string" } },
                        LinkedInURL: { type: "string" },
                        TwitterURL: { type: "string" },
                        FacebookURL: { type: "string" },
                        InstagramURL: { type: "string" },
                        Specialization: {
                            type: "string",
                            enum: [
                                "Software Development",
                                "IT Infrastructure",
                                "Data & Analytics",
                                "Product Management",
                                "Database Management",
                                "UI/UX Design",
                                "Marketing",
                                "Sales",
                                "Finance",
                                "Human Resources",
                            ],
                        },
                    },
                    additionalProperties: false,
                };
                break;
            default:
                throw new Error("Invalid entity type");
        }

        const assistant = await openai.beta.assistants.create({
            name: "File Parser",
            instructions:
                "You are an expert file data extractor. Extract the required information from the provided file accurately and efficiently. Focus on structured data extraction and ensure the output is well-formatted.",
            model: "gpt-4o",
            tools: isImage ? [] : [{ type: "file_search" }],
            response_format: {
                type: "json_schema",
                json_schema: {
                    name: "resume-schema",
                    description: "Resume details of a candidate",
                    schema: Schema,
                    strict: false,
                },
            },
        });

        // Create a vector store including our two files.
        let vectorStore = await openai.vectorStores.create({
            name: "File Parser",
        });

        await openai.beta.assistants.update(assistant.id, {
            tool_resources: { file_search: { vector_store_ids: [vectorStore.id] } },
        });

        // A user wants to attach a file to a specific message, let's upload it.
        const uploadedFile = await openai.files.create({
            file: file,
            purpose: isImage ? "vision" : "assistants",
        });

        const thread = await openai.beta.threads.create({
            messages: [
                {
                    role: "user",
                    content: isImage
                        ? [
                            {
                                type: "text",
                                text: "Extract the text and details from this image.",
                            },
                            {
                                type: "image_file",
                                image_file: { file_id: uploadedFile.id },
                            },
                        ]
                        : "Extract the details from the uploaded document.",
                    attachments: isImage
                        ? []
                        : [{ file_id: uploadedFile.id, tools: [{ type: "file_search" }] }],
                },
            ],
        });

        const promisify = () => {
            return new Promise((resolve, reject) => {
                try {
                    openai.beta.threads.runs
                        .stream(thread.id, {
                            assistant_id: assistant.id,
                        })
                        .on("textCreated", () => console.log("assistant >"))
                        .on("toolCallCreated", (event) =>
                            console.log("assistant " + event.type)
                        )
                        .on("messageDone", async (event) => {
                            if (event.content[0].type === "text") {
                                const { text } = event.content[0];
                                const { annotations } = text;
                                const citations: string[] = [];

                                let index = 0;
                                for (let annotation of annotations) {
                                    text.value = text.value.replace(
                                        annotation.text,
                                        "[" + index + "]"
                                    );
                                    const { file_citation } = annotation;
                                    if (file_citation) {
                                        const citedFile = await openai.files.retrieve(
                                            file_citation.file_id
                                        );
                                        citations.push("[" + index + "]" + citedFile.filename);
                                    }
                                    index++;
                                }

                                console.log(text.value);
                                console.log(citations.join("\n"));
                                resolve(text.value);
                            }
                        });
                } catch (error) {
                    reject(error);
                }
            });
        };

        const response = {
            extractedData: await promisify(),
        };

        return json(response);
    } catch (error) {
        console.error(error);
        return json({ error: error.message }, { status: 500 });
    }
};