const pdfParse = require('pdf-parse');
const { generateInterviewreport, generateResumePDF } = require('../services/ai.service')
const interviewReportModel = require('../models/interviewReport.model');

function getUserId(req) {
    return req.user?.id || req.user?._id;
}

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
    try {
        const { jobDescription, selfDescription } = req.body;
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        if (!jobDescription?.trim()) {
            return res.status(400).json({
                message: "Job description is required"
            });
        }

        if (!req.file && !selfDescription?.trim()) {
            return res.status(400).json({
                message: "Please provide either a resume PDF or a self description"
            });
        }

        if (req.file && req.file.mimetype !== 'application/pdf') {
            return res.status(400).json({
                message: "Only PDF resume files are supported"
            });
        }

        let resumeText = "";
        if (req.file?.buffer) {
            const parsedResume = await pdfParse(req.file.buffer);
            resumeText = parsedResume?.text || "";
        }

        const interviewReportbyAI = await generateInterviewreport({
            jobDescription: jobDescription.trim(),
            resume: resumeText,
            selfDescription: selfDescription?.trim() || ""
        });

        const normalizedPreparationPlan = normalizePreparationPlan(interviewReportbyAI);

        const interviewReport = await interviewReportModel.create({
            user: userId,
            jobDescription: jobDescription.trim(),
            candidateResume: resumeText,
            selfDescription: selfDescription?.trim() || "",
            ...interviewReportbyAI,
            // Keep backward compatibility with existing schema typo: preperationPlan
            preperationPlan: normalizedPreparationPlan
        });

        return res.status(201).json({
            message: "Interview report generated successfully",
            interviewReport
        });
    } catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to generate interview report"
        });
    }

}

/** 
 * @description Get interview report by interview id. 
 */
async function generateInterviewReportByIdController(req, res) {
    try {
        const { interviewId } = req.params
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        const interviewReport = await interviewReportModel.findOne({ _id: interviewId, user: userId })

        if (!interviewReport) {
            return res.status(404).json({
                message: "Interview report not found"
            })
        }

        if (!Array.isArray(interviewReport.preperationPlan) || !interviewReport.preperationPlan.length) {
            interviewReport.preperationPlan = buildFallbackPreparationPlan(interviewReport)
            await interviewReport.save()
        }

        return res.status(200).json({
            message: "Interview report fetched successfully",
            interviewReport
        })
    } catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to fetch interview report"
        });
    }
}


/**
 * @description Get all interview reports of user.
 */
async function getALLinterview(req, res) {
    try {
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        const interviewReports = await interviewReportModel
            .find({ user: userId })
            .sort({ createdAt: -1 })
            .select("-candidateResume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preperationPlan")

        return res.status(200).json({
            message: "Interview reports fetched successfully",
            interviewReports
        })
    } catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to fetch interview reports"
        });
    }
}



/**
 * @description Generate PDF version of resume using AI based on resume content, self description and job description.
 * 
 */

async function generateResumePDFController(req, res) {
    try {
        const { interviewReportId } = req.params
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        const interviewreport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: userId
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
        return res.send(pdfbuffer)
    } catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to generate resume PDF"
        });
    }
}

/**
 * @description Delete interview report by id for current user.
 */
async function deleteInterviewReportController(req, res) {
    try {
        const { interviewId } = req.params;
        const userId = getUserId(req);

        if (!userId) {
            return res.status(401).json({
                message: "Unauthorized user"
            });
        }

        const deletedReport = await interviewReportModel.findOneAndDelete({
            _id: interviewId,
            user: userId
        });

        if (!deletedReport) {
            return res.status(404).json({
                message: "Interview report not found"
            });
        }

        return res.status(200).json({
            message: "Interview report deleted successfully",
            interviewId
        });
    } catch (error) {
        return res.status(500).json({
            message: error?.message || "Failed to delete interview report"
        });
    }
}

module.exports = {
    generateInterviewReportController,
    generateInterviewReportByIdController,
    getALLinterview,
    generateResumePDFController,
    deleteInterviewReportController
}