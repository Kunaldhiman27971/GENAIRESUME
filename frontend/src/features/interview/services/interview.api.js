import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000/api/interview',
    withCredentials: true,
})

/**
 * @description This function generates an interview report by sending a POST request to the backend API. It takes in three parameters: selfDescription, jobDescription, and resumeFile. The function creates a FormData object to hold these parameters and sends it to the API endpoint "/api/interview/". The response from the API is returned as data.
 */
export const generateInterviewReport = async ({ selfDescription, jobDescription, resumeFile }) => {
    const formData = new FormData();
    formData.append('selfDescription', selfDescription);
    formData.append('jobDescription', jobDescription);
    formData.append('resume', resumeFile);
    const response = await api.post("/", formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
    return response.data
}


/**
 * @description this function provide report by reportid
 */
export const getInterviewReportById = async (interveiwId) => {
    const response = await api.get(`/report/${interveiwId}`)
    return response.data
}

/**
 * @description this function provide all report of user
 */

export const getAllInterviewReports = async () => {
    const response = await api.get("/reports")
    return response.data
}


/**
 * @description this function generate resume pdf from user input based on job description and self description and return the pdf buffer.
 */

export const generateResumePDF = async (interviewReportId) => {
    const response = await api.post(`/resume/pdf/${interviewReportId}`, null, {
        responseType: 'blob'
    })
    return response.data
}