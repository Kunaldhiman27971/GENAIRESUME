const express=require('express');
const authMiddleware=require('../middleware/auth.middleware');
const interviewController=require('../controllers/interview.controller');
const upload=require('../middleware/file.middleware')

const interviewRouter=express.Router();

/**
 * @route POST /api/interview
 * @desc generate new interview report on basis of user self description and resume and job description.
 * @access Private
 */

interviewRouter.post("/",authMiddleware.authUser, upload.single("resume"),interviewController.generateInterviewReportController);

module.exports=interviewRouter;