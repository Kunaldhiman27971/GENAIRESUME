const { GoogleGenAI } = require('@google/genai')
const zod = require("zod")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_API_KEY
})


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
    Job Description: ${jobDescription}`

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: zod.toJSONSchema(interviewReportSchema)
        }
    })

    return JSON.parse (response.text)

}

module.exports = generateInterviewreport