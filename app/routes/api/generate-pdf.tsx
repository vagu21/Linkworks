import { json, ActionFunction } from '@remix-run/node';
import Puppeteer from 'puppeteer';
export let action: ActionFunction = async ({ request }) => {
    const { html } = await request.json();
    try {
        const browser = await Puppeteer.launch();
        const page = await browser.newPage();
        
        // Set the content of the page to the HTML received in the request
        await page.setContent(html);
        
        // Wait for the content to load and adjust any dynamic elements (optional)
        await page.waitForSelector('body');
        // Get the content dimensions (width and height)
        const content = await page.evaluate(() => {
            const body = document.body;
            return {
                width: Math.max(body.scrollWidth, body.offsetWidth, body.clientWidth),
                height: Math.max(body.scrollHeight, body.offsetHeight, body.clientHeight),
            };
        });
        // Generate the PDF with dynamic size based on the content
        const pdfBuffer = await page.pdf({
            width: `${content.width}px`,  // Use content width
            height: `${content.height}px`,  // Use content height
            printBackground: true,
        });
        
        await browser.close();
        
        return new Response(pdfBuffer, {
            status: 200,
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': 'attachment; filename="resume.pdf"',
            },
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        return json({ message: 'Error generating PDF' }, { status: 500 });
    }
};