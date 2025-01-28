import { json, ActionFunction } from "@remix-run/node";
import Puppeteer from "puppeteer";
import { generateResume } from "app/modules/mediaExport/Resume/utils";
import { generateJD } from "~/modules/mediaExport/Job/utils";

export let action: ActionFunction = async ({ request }) => {
  const { id, type } = await request.json();

  let html = "";

  switch (type) {
    case "resume":
      html = (await generateResume(id)) || "";
      break;
    case "job":
      html = (await generateJD(id)) || "";
      break;
    default:
      html = "";
      console.warn(`Unhandled type: ${type}`);
  }

  try {
    const isProduction = process.env.NODE_ENV === "production";
    const browser = await Puppeteer.launch(isProduction ?{
      headless:true,
      executablePath:  "/var/lib/snapd/snap/bin/chromium", 
      args: ["--no-sandbox", "--disable-setuid-sandbox"], 
    } : {}
    );
    const page = await browser.newPage();
    
    await page.setContent(html);

    await page.waitForSelector("body");
    
    // Get the content width and height after setting the content
    const content = await page.evaluate(() => {
      const body = document.body;
      body.style.margin = '0';
      body.style.padding = '0';
      body.style.overflow = 'hidden'; // Prevent overflow and extra space
      return {
        width: Math.max(body.scrollWidth, body.offsetWidth, body.clientWidth),
        height: Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight),
      };
    });

    // Set the viewport size to match the content size
    await page.setViewport({
      width: content.width,
      height: content.height,
      deviceScaleFactor: 1,
    });

    // Generate the PDF with calculated width and height
    const pdfBuffer = await page.pdf({
      width: `${content.width}px`,
      height: `${content.height}px`,
      printBackground: true,
      margin: {
        top: '0px',
        right: '0px',
        bottom: '0px',
        left: '0px',
      },
      scale: 1, // Optional: scale if the content is too large
    });

    await browser.close();

    return new Response(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="resume.pdf"',
      },
    });
  } catch (error) {
    console.error("Error generating PDF:", error);
    return json({ message: "Error generating PDF" }, { status: 500 });
  }
};
