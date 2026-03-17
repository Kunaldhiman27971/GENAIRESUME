import { getAllInterviewReports, getInterviewReportById, generateInterviewReport, generateResumePDF, deleteInterviewReport } from '../services/interview.api'
import { useCallback, useContext } from 'react'
import { InterviewContext } from '../interview.context'

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }
    const {
        loading,
        setLoading,
        report,
        setReport,
        reports,
        setReports,
        downloadingResume,
        setDownloadingResume,
        resumePreviewUrl,
        setResumePreviewUrl
    } = context

    const generateReport = useCallback(async ({ selfDescription, jobDescription, resumeFile }) => {
        setLoading(true)
        let data = null
        try {
            data = await generateInterviewReport({ selfDescription, jobDescription, resumeFile })
            setReport(data?.interviewReport || null)
        } catch (error) {
            console.error("Error generating interview report:", error)
            throw error
        } finally {
            setLoading(false)
        }
        return data?.interviewReport || null
    }, [setLoading, setReport])

    const getReportById = useCallback(async (interviewId) => {
        setLoading(true)
        let data = null
        try {
            data = await getInterviewReportById(interviewId)
            setReport(data?.interviewReport || null)
        }
        catch (error) {
            console.error("Error fetching interview report by ID:", error)
        }
        finally {
            setLoading(false)
        }
        return data?.interviewReport || null
    }, [setLoading, setReport])

    const getAllReports = useCallback(async () => {
        setLoading(true)
        let data = null
        try {
            data = await getAllInterviewReports()
            setReports(data?.interviewReports || [])
        }
        catch (error) {
            console.error("Error fetching all interview reports:", error)
        }
        finally {
            setLoading(false)
        }
        return data?.interviewReports || []
    }, [setLoading, setReports])

    const getResumePdf = async (interviewReportId) => {
        if (!interviewReportId) {
            return null
        }

        let data = null
        try {
            setDownloadingResume(true)
            data = await generateResumePDF(interviewReportId)
            const blob = new Blob([data], { type: 'application/pdf' })
            const url = window.URL.createObjectURL(blob)

            if (resumePreviewUrl) {
                window.URL.revokeObjectURL(resumePreviewUrl)
            }
            setResumePreviewUrl(url)

            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        }
        catch (error) {
            console.error("Error generating resume PDF:", error)
        } finally {
            setDownloadingResume(false)
        }

        return data
    }

    const removeReport = useCallback(async (interviewId) => {
        if (!interviewId) {
            return false
        }

        try {
            await deleteInterviewReport(interviewId)
            setReports((prev) => (Array.isArray(prev) ? prev.filter((item) => item?._id !== interviewId) : []))
            setReport((prev) => (prev?._id === interviewId ? null : prev))
            return true
        } catch (error) {
            console.error("Error deleting interview report:", error)
            return false
        }
    }, [setReport, setReports])

    return {
        loading,
        report,
        reports,
        downloadingResume,
        resumePreviewUrl,
        generateReport,
        getReportById,
        getAllReports,
        getResumePdf,
        removeReport
    }
}
