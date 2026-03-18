const { GoogleGenAI } = require('@google/genai')
const zod = require("zod")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
})

const INTERVIEW_MODELS = [
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-3-flash-preview"
]

const RESUME_MODELS = [
    "gemini-3-flash-preview",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash"
]

async function generateJsonWithModelFallback({ models, prompt }) {
    const failures = []

    for (const model of models) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            })

            const responseText = typeof response.text === "string" ? response.text : ""

            if (!responseText) {
                failures.push(`${model}: empty response`)
                continue
            }

            return JSON.parse(responseText)
        } catch (error) {
            failures.push(`${model}: ${error?.message || "Unknown error"}`)
        }
    }

    throw new Error(`All AI models failed. ${failures.join(" | ")}`)
}


const interviewReportSchema = zod.object({

    matchScore: zod.number().describe("The match score between the candidate and the job description, on a scale of 0 to 100"),

    technicalQuestions: zod.array(zod.object({
        question: zod.string().describe("The technical question can be asked during the interview"),
        intention: zod.string().describe("The intention behind asking the technical question"),
        answer: zod.string().describe("How to answer this question, what points to cover , what approach to take while answering")
    })).describe("A list of technical questions that can be asked during the interview, along with the intention behind asking each question and how to answer it"),

    behavioralQuestions: zod.array(zod.object({
        question: zod.string().describe("The behavioral question can be asked during the interview"),
        intention: zod.string().describe("The intention behind asking the behavioral question"),
        answer: zod.string().describe("How to answer this question, what points to cover , what approach to take while answering")
    })).describe("A list of behavioral questions that can be asked during the interview, along with the intention behind asking each question and how to answer it"),

    skillGaps: zod.array(zod.object({
        skill: zod.string().describe("The skill in which the candidate is lacking"),
        severity: zod.enum(["low", "medium", "high"]).describe("The severity of the skill gap")
    })).describe("A list of skill gaps that the candidate has, along with the severity of each skill gap"),

    preparationPlan: zod.array(zod.object({
        day: zod.number().describe("The day number of the preparation plan"),
        focus: zod.string().describe("The focus of the preparation for that day"),
        tasks: zod.array(zod.string()).describe("The tasks to be completed on that day for preparation")
    })).describe("A preparation plan for the candidate to follow, with daily focus areas and tasks to complete"),
    title: zod.string().describe("The title of the interview report, which can be used as a reference for the candidate"),

})

async function generateInterviewreport({ jobDescription, resume, selfDescription }) {
    const prompt = `Generate an interview report for a candidate based on the following information:
    Resume: ${resume}
    Self Description: ${selfDescription}
        Job Description: ${jobDescription}
Return ONLY valid JSON with this exact shape:
{
    "matchScore": number,
    "technicalQuestions": [{ "question": string, "intention": string, "answer": string }],
    "behavioralQuestions": [{ "question": string, "intention": string, "answer": string }],
    "skillGaps": [{ "skill": string, "severity": "low" | "medium" | "high" }],
    "preparationPlan": [{ "day": number, "focus": string, "tasks": string[] }],
    "title": string
}`

    const parsed = await generateJsonWithModelFallback({
        models: INTERVIEW_MODELS,
        prompt
    })

    return interviewReportSchema.parse(parsed)

}


const fs = require("fs");
const path = require("path");

function getChromePath() {
  const baseDir = path.join(process.cwd(), ".puppeteer-cache", "chrome");

  if (!fs.existsSync(baseDir)) {
    throw new Error(`Chrome cache directory not found: ${baseDir}`);
  }

  const folders = fs.readdirSync(baseDir);
  const linuxFolder = folders.find((folder) => folder.startsWith("linux-"));

  if (!linuxFolder) {
    throw new Error(`No Linux Chrome folder found inside: ${baseDir}`);
  }

  return path.join(baseDir, linuxFolder, "chrome-linux64", "chrome");
}

async function generatePdfFromHtml(htmlContent) {
  const isHostedRuntime =
    Boolean(process.env.RENDER) || process.env.NODE_ENV === "production";

  const launchOptions = {
    headless: true,
  };

  if (isHostedRuntime) {
    launchOptions.args = ["--no-sandbox", "--disable-setuid-sandbox"];
    launchOptions.executablePath = getChromePath();
  }

  let browser;

  try {
    browser = await puppeteer.launch(launchOptions);
    const page = await browser.newPage();

    await page.setContent(htmlContent, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      margin: {
        top: "15mm",
        bottom: "15mm",
        left: "10mm",
        right: "10mm",
      },
    });

    return pdfBuffer;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

async function generateResumePDF({ resume, selfDescription, jobDescription }) {
    const resumepdfSchema = zod.object({
        html: zod.string().describe("The HTML content of the resume , which can be rendered to create a PDF version of the resume")
    })

    const prompt = `Generate a Resume of the candidate based on the following information:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
the response should be in HTML format and should be designed in a way that it can be directly converted to PDF and should be ATS friendly
The content of the resume should be not sound like its generated by AI and close to human written resume and should be ATS friendly. The HTML should be well structured and should have proper tags for different sections of the resume like experience, education, skills etc.
You can highlight the content with different font styles but the overall design should be professional and suitable for job applications.
The resume should not be more than 2 pages when converted to PDF and should be concise and to the point, highlighting the most relevant information for the job application.
Use Metty resume builder as a reference for designing the resume but do not copy the content from there as the content should be unique and generated based on the input provided by the user.
links should be in working conditions and should be clickable in the PDF version of the resume.

Return ONLY valid JSON in this format:
{
    "html": "<full html document string>"
}
`


    const jsonContent = resumepdfSchema.parse(await generateJsonWithModelFallback({
        models: RESUME_MODELS,
        prompt
    }))

    const pdfBuffer = await generatePdfFromHtml(jsonContent.html)

    return pdfBuffer
}

module.exports = { generateInterviewreport, generateResumePDF }