import { rowFetcher } from "../rowFetcher";

function getTopSkills(skills: { skillName: string; proficiency: number }[]) {
  return skills.sort((a, b) => b.proficiency - a.proficiency);
}

export async function generateResume(id: any) {
  const data = await rowFetcher(id, "Candidate");

  const skillMapping = data?.skills?.map((skill: any) => {
    return {
      skillName: skill,
    };
  });

  let topSkills: any = getTopSkills(skillMapping);

  function generateResumeString() {
    return `
        <!doctype html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Resume</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-[#F8F7EF] w-[205mm] !h-[calc(100vh-0px)]">
          <!-- Container -->
          <div class=" rounded-lg bg-[#F8F7EF] shadow-md w-[205mm] min-h-[297mm]">
            <!-- Header Section -->
           ${headerSection()}
      
            <!-- Details Section -->
            ${detailsSection()}
                <!-- Skills -->
               ${skillsSection()}

               <!-- Address -->
               ${addressSection()}
      
              <!-- Social Links -->
              ${socialLinksSection()}
      
             
      
              <!-- background image -->
          ${backgroundImage()}
      
            <!-- Footer -->
            ${footerSection()}
          </div>
          
        </body>
      </html>`;
  }

  function calculateCareerBreak(data: any) {
    const workExperiences = data?.["Work Experience"] || [];
    if (!Array.isArray(workExperiences) || workExperiences.length === 0) return "0";

    const sorted = workExperiences.filter((exp) => exp?.startDate).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

    let totalGap = 0;
    for (let i = 1; i < sorted.length; i++) {
      const prev = sorted[i - 1];
      const curr = sorted[i];

      const prevEndDate = prev.currentlyWorkingInThisRole ? new Date() : prev.endDate ? new Date(prev.endDate) : new Date(prev.startDate);

      const currStartDate = new Date(curr.startDate);

      if (!isNaN(prevEndDate.getTime()) && !isNaN(currStartDate.getTime())) {
        const gap = currStartDate.getTime() - prevEndDate.getTime();

        if (gap > 30 * 24 * 60 * 60 * 1000) {
          totalGap += gap;
        }
      }
    }

    const years = totalGap / (365.25 * 24 * 60 * 60 * 1000);
    return years.toFixed(1);
  }

  function headerSection() {
    const careerBreakYears = calculateCareerBreak(data);

    return `
     
      <div class="">
        <header class="mx-auto">
          <section class="px-6 pt-5 pb-3 w-full bg-[#F7E47F] max-md:px-5 max-md:max-w-full">
            <div class="flex flex-wrap gap-2.5 items-center w-full max-md:max-w-full">
              <div class="flex items-center justify-center gap-3 self-stretch px-3 my-auto w-11 h-11 text-base font-semibold whitespace-nowrap bg-[#0B0A09] min-h-11 rounded-[1100px] text-[#F8F8F8]">
                ${data?.firstName?.[0] || "N/A"}${data?.lastName?.[0] || "N/A"}
              </div>
              <div class="flex-1 shrink self-stretch my-auto basis-[22px] min-w-60 text-[#1A1A1A]">
                <h1 class="text-base font-semibold">${data?.firstName || "N/A"} ${data?.lastName || "N/A"}</h1>
                <p class="text-xs font-normal">${data?.currentDesignation || '<span style="color: #1A1A1A;">N/A</span>'}</p>
              </div>
              <div class="flex flex-col justify-center self-stretch px-2 py-1 my-auto bg-[#E8D35B] rounded-[100px]">
                <div class="flex gap-1 justify-center items-center w-full">
                  <span class="self-stretch my-auto font-medium text-[10px] text-[#34320E]">Career Break :</span>
               <span class="self-stretch my-auto font-bold text-[10px] text-[#34320E]">${careerBreakYears || "N/A"} Years</span>


                </div>
              </div>
            </div>
          </section>
          <section class="flex flex-col justify-center px-6 py-2 w-full bg-[#E8D35B] max-md:px-5 max-md:max-w-full">
            <div class="flex flex-wrap gap-10 justify-between items-center w-full max-md:max-w-full">
              <div class="flex gap-1 items-center self-stretch my-auto">
                <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/e6e4078735543791a1c0b0304486f82fb09467d6?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839" alt="Experience icon" class="object-contain shrink-0 self-stretch my-auto w-3 aspect-square" />
                <span class="self-stretch my-auto text-[8px] text-[#34320E] font-bold">${data?.totalExperienceInYears || "0"}y Experience</span>
              </div>
              <div class="flex gap-3 items-center self-stretch my-auto">
                <div class="flex gap-1 items-center self-stretch my-auto">
                  <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/9fb225e49fc06ea42092935c70a30a181506b73d?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839" alt="Phone icon" class="object-contain shrink-0 self-stretch my-auto w-3 aspect-square" />
                  <a href="tel:${data?.phone || "#"}" class="self-stretch my-auto text-[8px] text-[#34320E] font-bold">${
      data?.phone || '<span style="color: #34320E;">N/A</span>'
    }</a>
                </div>
                <div class="flex gap-1 items-center self-stretch my-auto whitespace-nowrap">
                  <img src="https://cdn.builder.io/api/v1/image/assets/TEMP/fc2e443cb356a1272f78bacb54182fa5a942c8a6?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839" alt="Email icon" class="object-contain shrink-0 self-stretch my-auto w-3 aspect-square" />
                  <a href="mailto:${data?.email || "#"}" class="self-stretch my-auto text-[8px] text-[#34320E] font-bold">${
      data?.email || '<span style="color: #34320E;">N/A</span>'
    }</a>
                </div>
              </div>
            </div>
          </section>
        </header>
      </div>
    `;
  }

  function detailsSection() {
    return `<div class="flex  flex-col px-6 md:flex-row relative !h-[calc(100vh-140px)]">
            <!-- Left Section -->
              <div class="py-4 md:w-[60.82%]">
                <!-- Experience -->
              ${experienceSection()}
                <!-- Education -->
                ${educationSection()}

                <!-- Certifications -->
               ${certificationsSection()}

             
              
      
                
              </div>
              <!--Right Section -->
              <div class="flex-1 md:pl-[14px] md:border-l my-4">

                <!-- Details -->
                <div class="relative">
                 
                </div>`;
  }

  function skillsSection() {
    return `
      <section class="skills-section flex flex-col gap-2 items-start mb-[28px]">
        <header class="flex flex-col gap-[3px] items-start w-full">
          <h2 class="gap-6 w-full text-xs font-semibold text-[#190C00]">Skills :</h2>
          <div class="flex flex-col gap-2.5 items-start w-full">
            <div class="h-0.5 rounded-[20px] bg-[#190C00] w-[58px]"></div>
          </div>
        </header>
        <ul class="flex flex-wrap gap-1 items-start w-full max-w-[600px]">
          ${
            topSkills?.length > 0
              ? topSkills
                  .map(
                    (skill: any) => `
                      <li class="gap-1 px-2 py-1 text-[8px] text-[#FFFFFF] rounded-[6px] bg-[#0B0A09] border-[0.5px] border-[#E6E6E6]">
                        ${skill?.skillName || '<span style="color:#1A1A1A;">N/A</span>'}
                      </li>
                    `
                  )
                  .join("")
              : '<li style="color:#1A1A1A;">N/A</li>'
          }
        </ul>
      </section>
    `;
  }

  function addressSection() {
    return `
     <article class="flex flex-col gap-2 items-start mb-[28px]">
        <header class="flex flex-col gap-[3px] items-start w-full">
          <h2 class="gap-6 w-full text-xs font-semibold text-[#190C00]">Address:</h2>
          <div class="flex flex-col gap-2.5 items-start w-full">
            <div class="h-0.5 rounded-[20px] bg-[#190C00] w-[58px]"></div>
          </div>
        </header>
        <section class="flex flex-col gap-3 items-start w-full">
          <div class="flex gap-1 items-start w-full">
           <figure class ="pt-1"
                
              >
              <svg width="9" height="9" viewBox="0 0 9 9" fill="none" xmlns="http://www.w3.org/2000/svg">
<path d="M6 8.41645V5.08312C6 4.97261 5.9561 4.86663 5.87796 4.78849C5.79982 4.71035 5.69384 4.66645 5.58333 4.66645H3.91667C3.80616 4.66645 3.70018 4.71035 3.62204 4.78849C3.5439 4.86663 3.5 4.97261 3.5 5.08312V8.41645M1 3.83312C0.999971 3.71189 1.02639 3.59213 1.07741 3.48216C1.12843 3.3722 1.20283 3.2747 1.29542 3.19645L4.21208 0.696866C4.36249 0.569745 4.55307 0.5 4.75 0.5C4.94693 0.5 5.13751 0.569745 5.28792 0.696866L8.20458 3.19645C8.29717 3.2747 8.37157 3.3722 8.42259 3.48216C8.47361 3.59213 8.50003 3.71189 8.5 3.83312V7.58312C8.5 7.80413 8.4122 8.01609 8.25592 8.17237C8.09964 8.32865 7.88768 8.41645 7.66667 8.41645H1.83333C1.61232 8.41645 1.40036 8.32865 1.24408 8.17237C1.0878 8.01609 1 7.80413 1 7.58312V3.83312Z" stroke="#8E8E8E" stroke-width="0.8" stroke-linecap="round" stroke-linejoin="round"/>
</svg>

              </figure>
            <p class="flex-1 shrink text-[8px] font-normal  basis-0 leading-4 text-[#1C1C1C]">
              <span>
              ${data?.currentLocation ? data?.currentLocation : '<span style="color: #1C1C1C;">N/A</span>'}
</span>
            </p>
          </div>
        </section>
      </article>
     
    `;
  }

  function socialLinksSection() {
    return `
     <section
        class="social-links-container flex flex-col gap-2 items-start mb-[28px]"
      >
        <header class="flex flex-col gap-[3px] items-start w-full">
          <h2 class="gap-6 w-full text-xs font-semibold text-[#190C00]">Social Links :</h2>
          <div class="flex flex-col gap-2.5 items-start w-full">
            <div class="h-0.5 rounded-[20px] bg-[#190C00] w-[58px]"></div>
          </div>
        </header>
        <nav class="social-links-nav flex flex-col gap-2 w-full">
        ${
          data?.linkedinProfileUrl
            ? `<a href="${data.linkedinProfileUrl}" target="_blank" class="gap-2 text-[8px] leading-4 font-normal underline text-[#1C1C1C]">LinkedIn</a>`
            : `<span class="text-[8px] leading-4 font-normal text-[#1C1C1C]">LinkedIn: N/A</span>`
        }
        ${
          data?.portfolio
            ? `<a href="${data.portfolio}"  target="_blank" class="gap-2 text-[8px] leading-4 font-normal underline text-[#1C1C1C]">Portfolio</a>`
            : `<span class="text-[8px] leading-4 font-normal text-[#1C1C1C]">Portfolio: N/A</span>`
        }
         
             ${
               data?.other
                 ? `<a href="${data.other}"  target="_blank" class="gap-2 text-[8px] leading-4 font-normal underline text-[#1C1C1C]">Others</a>`
                 : `<span class="text-[8px] leading-4 font-normal text-[#1C1C1C]">Others: N/A</span>`
             }
        </nav>
      </section>

       </div>
    `;
  }

  function experienceSection() {
    return `
      <section class="">
       <div class="flex flex-col gap-2 items-start w-full">
        <header class="flex flex-col gap-[3px] items-start w-full">
           <h2 class="gap-6 w-full text-xs font-semibold text-[#190C00]">Experience :</h2>
         <div class="flex flex-col gap-2.5 items-start w-full">
            <div class="h-0.5 rounded-[20px] bg-[#190C00] w-[58px]"></div>
          </div>
        </header>
        ${
          data?.["Work Experience"]?.length > 0
            ? data["Work Experience"]
                .map(
                  (exp: any) => `
                  <div class="pr-4">
            <article class="max-w-[400px] mb-5">
              <header class="w-full">
                <div class="flex gap-2 items-center pb-0.5 w-full text-xs leading-tight">
                  <h3 class="self-stretch my-auto font-semibold text-[#121212] text-[10px]">${
                    exp?.companyName || '<span style="color: #121212;">N/A</span>'
                  }</h3>
                  <img
                    src="https://cdn.builder.io/api/v1/image/assets/TEMP/2271f0fc22781265f0fb836384aea80aee81470d?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839"
                    class="object-contain shrink-0 self-stretch my-auto aspect-square w-[3px]"
                    alt="Separator"
                  />
                  <p class="flex-1 shrink self-stretch my-auto basis-0 text-[#121212] text-[10px] font-normal">
                    ${exp?.title || '<span style="color: #A0A0A0;">N/A</span>'}
                  </p>
                </div>
                <p class="flex-1 shrink gap-2.5 self-stretch w-full text-[8px] text-[#121212] font-semibold leading-loose whitespace-nowrap basis-0">
                  ${exp?.location || '<span style="color: #A0A0A0;">N/A</span>'}
                </p>
              </header>
  
              <section class="flex gap-1 mt-1 w-full">
                <div class="flex flex-col justify-between items-center py-1.5 w-1.5">
                  <span class="flex w-1.5 h-1.5 bg-[#4A3826] min-h-1.5 rounded-[100px]" aria-hidden="true"></span>
                  <span class="flex flex-1 w-px bg-[#4A3826] min-h-[60px]" aria-hidden="true"></span>
                  <span class="flex w-1.5 h-1.5 bg-[#4A3826] min-h-1.5 rounded-[100px]" aria-hidden="true"></span>
                </div>
  
                <div class="flex-1 shrink self-start w-full text-[8px] font-semibold leading-loose basis-0 min-w-60 text-[#121212]">
                  <time class="flex-1 shrink gap-2.5 self-stretch w-full basis-0">
                   ${
                     exp?.startDate
                       ? exp?.currentlyWorkingInThisRole
                         ? `${new Date(exp.startDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })} (Currently Working)`
                         : new Date(exp.startDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })
                       : "N/A"
                   }
                  </time>
  
                  ${
                    exp?.description
                      ? `<p class="mt-2 pl-2 text-[8px] font-normal text-[#1A1A1A] leading-snug">
                          ${exp.description}
                        </p>`
                      : ""
                  }
  
                  <ul class="pl-2 mt-3 w-full leading-4 text-zinc-900">
                    ${
                      Array.isArray(exp?.description) && exp.description.length > 0
                        ? exp.description
                            .map(
                              (point: string) => `
                      <li class="flex gap-2 items-start mt-2 w-full">
                        <img
                          src="https://cdn.builder.io/api/v1/image/assets/TEMP/17e05694792f11c0a76e83684630a52c5a7386c3?placeholderIfAbsent=true&apiKey=f503c6e3cdcd400faefec985da817839"
                          class="object-contain shrink-0 w-1 aspect-[0.29]"
                          alt="Bullet point"
                        />
                        <p class="flex-1 shrink basis-0">${point}</p>
                      </li>`
                            )
                            .join("")
                        : `<li class="text-[8px] text-[#1A1A1A]"></li>`
                    }
                  </ul>
  
                  <time class="block mt-5 w-full">
                   ${
                     !exp?.currentlyWorkingInThisRole && exp?.endDate
                       ? `<time class="block mt-5 w-full">
         ${new Date(exp.endDate).toLocaleDateString(undefined, { month: "short", year: "numeric" })}
       </time>`
                       : ""
                   }
                  </time>
                </div>
              </section>
            </article>
            </div>
          `
                )
                .join("")
            : `<p class="text-[8px] text-[#1A1A1A]">N/A</p>`
        }
      </div>
      </section>
    `;
  }

  function educationSection() {
    return `
      <section class="education-section flex flex-col gap-4 justify-center items-start max-md:w-full max-sm:px-4 max-sm:py-0 max-sm:w-full mb-[20px]">
      <div class="flex flex-col gap-2 items-start w-full">
        <header class="flex flex-col gap-[3px] items-start w-full">
          <h2 class="gap-6 w-full text-xs font-semibold text-[#190C00]">Education :</h2>
          <div class="flex flex-col gap-2.5 items-start w-full">
            <div class="h-0.5 rounded-[20px] bg-[#190C00] w-[58px]"></div>
          </div>
          
        </header>
        <article class="flex flex-col gap-1 items-start w-full">
          ${
            data?.["Education History"]?.length > 0
              ? data["Education History"]
                  .map(
                    (education: any) => `
                      <div class="flex flex-col gap-2 items-start w-full">
                        <h3 class="w-full text-[10px] font-semibold text-[#121212]">
                          ${education?.educationQualification || "N/A"}${education?.educationalSpecialization ? " " + education.educationalSpecialization : ""}
                        </h3>
                        <p class="w-full text-[8px] text-[#121212] font-normal">
                          ${education?.startDate ? new Date(education.startDate).toLocaleDateString() : "N/A"} - ${
                      education?.endDate ? new Date(education.endDate).toLocaleDateString() : "N/A"
                    } | ${education?.schoolCollegeName || "N/A"}, ${education?.location || "N/A"}
                        </p>
                      </div>
                    `
                  )
                  .join("")
              : `<p class="text-[8px] text-[#121212]">N/A</p>`
          }
        </article>
        </div>
      </section>
       
    `;
  }

  function certificationsSection() {
    return `
      <section class="certification-section flex flex-col gap-4 justify-center items-start mb-[20px]">
        <div class="flex flex-col gap-2 items-start w-full">
          <header class="flex flex-col gap-1 items-start w-full">
            <h3 class="gap-6 w-full h-4 text-xs font-bold leading-5 text-stone-950">
              Certifications :
            </h3>
            <div class="flex flex-col gap-2.5 items-start w-full">
              <div class="h-0.5 rounded-3xl bg-stone-950 w-[58px]"></div>
            </div>
          </header>
  
          ${
            data?.["Certifications"]?.length > 0
              ? data["Certifications"]
                  .map(
                    (certification: any) => `
              <article class="flex flex-col gap-2 items-start w-full">
                 <h3 class="w-full text-[10px] font-semibold text-[#121212]">
                  ${certification?.name || '<span class="text-[#A0A0A0]">N/A</span>'}
                </h4>
                 <p class="w-full text-[8px] text-[#121212] font-normal">
                  ${certification?.expirationDate ? new Date(certification.expirationDate).toLocaleDateString() : "Present"} | ${
                      certification?.issuingOrganization || "N/A"
                    }
                </p>
              </article>
            `
                  )
                  .join("")
              : `<p class="text-[8px] text-[#121212]">N/A</p>`
          }
  
        </div>
      </section>
    `;
  }

  function backgroundImage() {
    return `<div class="absolute top-[50%] translate-y-[-50%] left-[37%]">
            
          </div>
            </div>`;
  }

  function footerSection() {
    return `
    <div class="absolute bottom-0 left-0 right-0 flex flex-col items-center justify-between border-t bg-stone-900 px-6 py-3 text-center md:flex-row">
              
    <div class="flex gap-0 items-center">
      <div class="flex justify-center items-center px-0.5 pt-1 pb-1 h-[19px] w-[19px]">
        <svg
          width="17"
          height="11"
          viewBox="0 0 17 11"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-[16px] h-[9px] flex-shrink-0"
        >
          <path
            d="M8.33168 7.32936L4.88184 1.1266C4.83033 1.03399 4.73268 0.976562 4.62671 0.976562H1.98554C1.26433 0.976562 0.806806 1.74941 1.1537 2.38172L5.01234 9.41519C5.50783 10.3184 6.80274 10.3258 7.30857 9.42837L8.33087 7.6146C8.38074 7.52613 8.38105 7.41811 8.33168 7.32936Z"
            fill="#FFD600"
          ></path>
          <path
            d="M14.027 7.32936L10.5772 1.1266C10.5256 1.03399 10.428 0.976562 10.322 0.976562H7.68085C6.95964 0.976562 6.50212 1.74941 6.84901 2.38172L10.7076 9.41519C11.2031 10.3184 12.4981 10.3258 13.0039 9.42837L14.0262 7.6146C14.0761 7.52613 14.0764 7.41811 14.027 7.32936Z"
            fill="#FF7900"
          ></path>
          <path
            d="M12.0031 1.40903L13.9488 4.95196C14.0609 5.15604 14.3551 5.15323 14.4632 4.94705L15.8732 2.25924C16.1792 1.67607 15.7562 0.976562 15.0977 0.976562H12.259C12.037 0.976562 11.8963 1.21447 12.0031 1.40903Z"
            fill="#214ECF"
          ></path>
        </svg>
      </div>
      <span class="ml-px text-xs font-bold leading-3 text-[#F8F7EF]">
        linkworks
      </span>
    </div>
    <div class="flex gap-6 items-center">
      <div class="flex gap-1 items-center">
        <svg
          width="16"
          height="17"
          viewBox="0 0 16 17"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          class="w-[16px] h-[16px]"
        >
          <g clip-path="url(#clip0_4228_22362)">
            <path
              d="M6.7226 7.7426C6.75594 7.5226 6.82927 7.32927 6.9226 7.1626C7.01594 6.99594 7.14927 6.85594 7.31594 6.74927C7.47594 6.64927 7.67594 6.6026 7.9226 6.59594C8.07594 6.6026 8.21594 6.62927 8.3426 6.6826C8.47594 6.7426 8.59594 6.8226 8.68927 6.9226C8.7826 7.0226 8.85594 7.1426 8.91594 7.27594C8.97594 7.40927 9.0026 7.55594 9.00927 7.7026H10.2026C10.1893 7.38927 10.1293 7.1026 10.0159 6.8426C9.9026 6.5826 9.74927 6.35594 9.54927 6.16927C9.34927 5.9826 9.10927 5.83594 8.82927 5.72927C8.54927 5.6226 8.2426 5.57594 7.9026 5.57594C7.46927 5.57594 7.08927 5.64927 6.76927 5.8026C6.44927 5.95594 6.1826 6.15594 5.96927 6.41594C5.75594 6.67594 5.59594 6.97594 5.49594 7.3226C5.39594 7.66927 5.33594 8.02927 5.33594 8.41594V8.59594C5.33594 8.9826 5.38927 9.3426 5.48927 9.68927C5.58927 10.0359 5.74927 10.3359 5.9626 10.5893C6.17594 10.8426 6.4426 11.0493 6.7626 11.1959C7.0826 11.3426 7.4626 11.4226 7.89594 11.4226C8.20927 11.4226 8.5026 11.3693 8.77594 11.2693C9.04927 11.1693 9.28927 11.0293 9.49594 10.8493C9.7026 10.6693 9.86927 10.4626 9.98927 10.2226C10.1093 9.9826 10.1826 9.72927 10.1893 9.45594H8.99594C8.98927 9.59594 8.95594 9.7226 8.89594 9.8426C8.83594 9.9626 8.75594 10.0626 8.65594 10.1493C8.55594 10.2359 8.4426 10.3026 8.30927 10.3493C8.1826 10.3959 8.04927 10.4093 7.90927 10.4159C7.66927 10.4093 7.46927 10.3626 7.31594 10.2626C7.14927 10.1559 7.01594 10.0159 6.9226 9.84927C6.82927 9.6826 6.75594 9.4826 6.7226 9.2626C6.68927 9.0426 6.66927 8.81594 6.66927 8.59594V8.41594C6.66927 8.1826 6.68927 7.9626 6.7226 7.7426ZM8.0026 1.83594C4.3226 1.83594 1.33594 4.8226 1.33594 8.5026C1.33594 12.1826 4.3226 15.1693 8.0026 15.1693C11.6826 15.1693 14.6693 12.1826 14.6693 8.5026C14.6693 4.8226 11.6826 1.83594 8.0026 1.83594ZM8.0026 13.8359C5.0626 13.8359 2.66927 11.4426 2.66927 8.5026C2.66927 5.5626 5.0626 3.16927 8.0026 3.16927C10.9426 3.16927 13.3359 5.5626 13.3359 8.5026C13.3359 11.4426 10.9426 13.8359 8.0026 13.8359Z"
              fill="#F8F7EF"
            ></path>
          </g>
          <defs>
            <clipPath id="clip0_4228_22362">
              <rect
                width="16"
                height="16"
                fill="white"
                transform="translate(0 0.5)"
              ></rect>
            </clipPath>
          </defs>
        </svg>
        <p class="text-xs text-stone-100">
          Copyright 2025 Linkfields. All Rights Reserved.
        </p>
      </div>
    </div>
    </div>


    `;
  }

  return generateResumeString();
}
