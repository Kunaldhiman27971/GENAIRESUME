const pdfParse = require('pdf-parse');
const genrateInterviewReport = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model');
const { PDFParse } = require('pdf-parse');

async function generateInterviewReportController(req, res) {
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { jobDescription, selfDescription } = req.body


    const interviewReportbyAI = await genrateInterviewReport({
        jobDescription,
        resume: resumeContent.text,
        selfDescription
    })

    const interviewReport = await interviewReportModel.create({
        user: req.user._id,
        jobDescription,
        resume: resumeContent.text,
        selfDescription,
        ...interviewReportbyAI
    })

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })

}

module.exports = {generateInterviewReportController}