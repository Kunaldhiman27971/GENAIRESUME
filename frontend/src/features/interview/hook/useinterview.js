import { getAllInterviewReports, getInterviewReportById, generateInterviewReport } from '../services/interview.api'
import { useCallback, useContext } from 'react'
import { InterviewContext } from '../interview.context'

export const useInterview = () => {
    const context = useContext(InterviewContext)
    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }
    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = useCallback(async ({ selfDescription, jobDescription, resumeFile }) => {
        setLoading(true)
        let data = null
        try {
            data = await generateInterviewReport({ selfDescription, jobDescription, resumeFile })
            setReport(data?.interviewReport || null)
        } catch (error) {
            console.error("Error generating interview report:", error)
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

    return {
        loading,
        report,
        reports,
        generateReport,
        getReportById,
        getAllReports
    }
}
