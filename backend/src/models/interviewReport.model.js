const { type } = require('express/lib/response')
const mongoose = require('mongoose')



/**
 * -job description:String
* -candidate resume:String
*-self description :String

*- Matchscore:number
*- technical questions:=
    [{
    question:"",
    intention:"",
    answer:"",
    }]
*-behavioural questions:=
    [{
    question:"",
    intention:"",
    answer:"",
    }]
*-skill gaps:=[{
    skill:"",
    severity:{
        type:String,
        enum:["low","medium","high"]
    },
    }]
*-preperation plan :  
[{
day:number,
focus:string,
tasks:[string]
}]
 */


// Define the schema for technical questions
const technicalQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "Technical question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention behind the question is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})

// Define the schema for behavioral questions
const behavioralQuestionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: [true, "behavioral question is required"]
    },
    intention: {
        type: String,
        required: [true, "Intention behind the question is required"]
    },
    answer: {
        type: String,
        required: [true, "Answer is required"]
    }
}, {
    _id: false
})

// Define the schema for skill gaps
const skillGapSchema = new mongoose.Schema({
    skill: {
        type: String,
        required: [true, "Skill name is required"]
    },
    severity: {
        type: String,
        enum: ["low", "medium", "high"],
        required: [true, "Severity of the skill gap is required"]
    }
}, {
    _id: false
})


// Define the schema for preperation plan
const preperationPlanSchema = new mongoose.Schema({
    day: {
        type: Number,
        required: [true, "Day number is required"]
    },
    focus: {
        type: String,
        required: [true, "Focus of the day is required"]
    },
    tasks: [{
        type: String,
        required: [true, "Task description is required"]
    }]
}, {
    _id: false
})



const interviewReportSchema = new mongoose.Schema({
    jobDescription: {
        type: String,
        required: [true, "Job description is required"]
    },
    candidateResume: {
        type: String,
    },
    selfDescription: {
        type: String,
    },
    matchScore: {
        type: Number,
        min: 0,
        max: 100
    },
    technicalQuestions: [technicalQuestionSchema],
    behavioralQuestions: [behavioralQuestionSchema],
    skillGaps: [skillGapSchema],
    preperationPlan: [preperationPlanSchema],
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    }
}, {
    timestamps: true
})


const interviewReportModel = mongoose.model("interviewReport", interviewReportSchema)

module.exports = interviewReportModel