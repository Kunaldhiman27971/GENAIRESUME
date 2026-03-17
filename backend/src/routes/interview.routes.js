const express = require('express');
const authMiddleware = require('../middleware/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middleware/file.middleware')

const interviewRouter = express.Router();

/**
 * @route POST /api/interview
 * @desc generate new interview report on basis of user self description and resume and job description.
 * @access Private
 */

interviewRouter.post("/", authMiddleware.authUser, upload.single("resume"), interviewController.generateInterviewReportController);




/**
 * @route GET /api/interview/report/:interviewId
 * @desc get interview report by interview id.
 * @access Private
 */

interviewRouter.get("/report/:interviewId", authMiddleware.authUser, interviewController.generateInterviewReportByIdController);



/**
 * @route GET /api/interview/reports
 * @desc get all interview reports of user.
 * @access Private
 */

interviewRouter.get('/reports', authMiddleware.authUser, interviewController.getALLinterview)


/**
 * @route POST /api/interview/resume/pdf/:interviewReportId
 * @desc generate resume pdf from user input based on job description and self description and return the pdf buffer.
 * @access Private
 */

interviewRouter.post('/resume/pdf/:interviewReportId', authMiddleware.authUser, interviewController.generateResumePDFController)


module.exports = interviewRouter;