const pdfParse = require('pdf-parse');
const { generateInterviewreport, generateResumePDF } = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model');

function buildFallbackPreparationPlan(aiReport = {}) {
    const technical = Array.isArray(aiReport.technicalQuestions) ? aiReport.technicalQuestions : [];
    const behavioral = Array.isArray(aiReport.behavioralQuestions) ? aiReport.behavioralQuestions : [];
    const skillGaps = Array.isArray(aiReport.skillGaps) ? aiReport.skillGaps : [];

    const focusPool = [
        ...skillGaps.map((gap) => gap.skill).filter(Boolean),
        ...technical.map((q) => q.question).filter(Boolean),
        ...behavioral.map((q) => q.question).filter(Boolean)
    ];

    const safeFocusPool = focusPool.length ? focusPool : [
        "Core Role Fundamentals",
        "Role-Specific Concepts",
        "Mock Interview Practice"
    ];

    return Array.from({ length: 7 }).map((_, index) => {
        const focusText = safeFocusPool[index % safeFocusPool.length];
        return {
            day: index + 1,
            focus: `Focus on ${focusText}`,
            tasks: [
                `Review and summarize key concepts for: ${focusText}`,
                `Practice 2-3 interview responses related to: ${focusText}`,
                "End the day with a 20-minute self-review and improvement notes"
            ]
        };
    });
}

function normalizePreparationPlan(aiReport = {}) {
    const fromAI = aiReport?.preparationPlan || aiReport?.preperationPlan || [];
    if (Array.isArray(fromAI) && fromAI.length) {
        return fromAI;
    }
    return buildFallbackPreparationPlan(aiReport);
}


/**
 * @description Generate interview report on basis of user self description and resume and job description.
 */

async function generateInterviewReportController(req, res) {
    const resumeContent = await (new pdfParse.PDFParse(Uint8Array.from(req.file.buffer))).getText()
    const { jobDescription, selfDescription } = req.body


    const interviewReportbyAI = await generateInterviewreport({
        jobDescription,
        resume: resumeContent.text,
        selfDescription
    })

    const normalizedPreparationPlan = normalizePreparationPlan(interviewReportbyAI);

    const interviewReport = await interviewReportModel.create({
        user: req.user._id,
        jobDescription,
        candidateResume: resumeContent.text,
        selfDescription,
        ...interviewReportbyAI,
        // Keep backward compatibility with existing schema typo: preperationPlan
        preperationPlan: normalizedPreparationPlan
    })

    res.status(201).json({
        message: "Interview report generated successfully",
        interviewReport
    })

}

/** 
 * @description Get interview report by interview id. 
 */
async function generateInterviewReportByIdController(req, res) {
    const { interviewId } = req.params
    const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: req.user._id })

    if (!interviewReport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    if (!Array.isArray(interviewReport.preperationPlan) || !interviewReport.preperationPlan.length) {
        interviewReport.preperationPlan = buildFallbackPreparationPlan(interviewReport)
        await interviewReport.save()
    }

    res.status(200).json({
        message: "Interview report fetched successfully",
        interviewReport
    })
}


/**
 * @description Get all interview reports of user.
 */
async function getALLinterview(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user._id }).sort({ createdAt: -1 }).select("-candidateResume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preperationPlan")
    res.status(200).json({
        message: "Interview reports fetched successfully",
        interviewReports
    })
}



/**
 * @description Generate PDF version of resume using AI based on resume content, self description and job description.
 * 
 */

async function generateResumePDFController(req, res) {
    const { interviewReportId } = req.params
    const interviewreport = await interviewReportModel.findOne({
        _id: interviewReportId,
        user: req.user._id
    })

    if (!interviewreport) {
        return res.status(404).json({
            message: "Interview report not found"
        })
    }

    const { candidateResume, selfDescription, jobDescription } = interviewreport

    const pdfbuffer = await generateResumePDF({
        resume: candidateResume,
        selfDescription,
        jobDescription
    })

    res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="resume_${interviewReportId}.pdf"`

    });
    res.send(pdfbuffer)
}

module.exports = { generateInterviewReportController, generateInterviewReportByIdController, getALLinterview, generateResumePDFController }