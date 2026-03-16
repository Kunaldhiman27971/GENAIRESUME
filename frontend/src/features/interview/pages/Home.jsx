import React, { useState, useRef } from "react";
import "../style/Home.scss"
import { useInterview } from "../hook/useinterview";
import { useNavigate } from "react-router";

const Home = () => {
    const { loading, generateReport } = useInterview()
    const [selfDescription, setSelfDescription] = useState("")
    const [jobDescription, setJobDescription] = useState("")
    const resumeFileRef = useRef()

    const navigate = useNavigate()

    const handleGenerateReport = async () => {
        const resumeFile = resumeFileRef.current.files[0]
        const data = await generateReport({ selfDescription, jobDescription, resumeFile })
        if (data?._id) {
            navigate(`/interview/${data._id}`)
        }
    }

    if (loading) {
        return (
            <main className="loading-overlay" aria-live="polite" aria-busy="true">
                <section className="loading-panel">
                    <div className="loading-ring-wrap" aria-hidden="true">
                        <div className="spinner"></div>
                        <div className="spinner-core"></div>
                    </div>

                    <p className="loading-kicker">AI Interview Engine</p>
                    <h1>Building Your Personalized Interview Strategy</h1>
                    <p className="loading-copy">
                        We are analyzing your job requirements, profile strengths, and skill gaps to create
                        focused questions and a preparation roadmap.
                    </p>

                    <ul className="loading-steps" aria-label="Report generation progress">
                        <li>Parsing resume and profile context</li>
                        <li>Generating technical and behavioral questions</li>
                        <li>Calculating match score and skill gaps</li>
                        <li>Preparing your day-by-day roadmap</li>
                    </ul>

                    <p className="loading-footnote">Usually takes around 20-30 seconds. Please keep this tab open.</p>
                </section>
            </main>
        )
    }


    return (
        <main className="home">
            <section className="plan-hero">
                <h1>
                    Create Your Custom <span>Interview Plan</span>
                </h1>
                <p>
                    Let our AI analyze the job requirements and your unique profile to
                    build a winning strategy.
                </p>
            </section>

            <section className="interview-card">
                <div className="interview-input-group">
                    <div className="left panel">
                        <div className="panel-title-row">
                            <h2>Target Job Description</h2>
                            <span className="tag required">Required</span>
                        </div>

                        <label htmlFor="jobDescription" className="sr-only">
                            Job Description
                        </label>
                        <textarea
                            onChange={(e) => { setJobDescription(e.target.value) }}
                            name="jobDescription"
                            id="jobDescription"
                            maxLength={5000}
                            placeholder="Paste the full job description here...&#10;e.g. 'Senior Frontend Engineer at Google requires proficiency in React, TypeScript, and large-scale system design...'"
                        />

                        <p className="char-count">0 / 5000 chars</p>
                    </div>

                    <div className="right panel">
                        <div className="panel-title-row">
                            <h2>Your Profile</h2>
                        </div>

                        <div className="input-group">
                            <div className="upload-title-row">
                                <p className="field-title">Upload Resume</p>
                                <span className="tag best">Best Results</span>
                            </div>

                            <label className="file-label" htmlFor="resume">
                                <span className="upload-icon" aria-hidden="true">^</span>
                                <span>Click to upload or drag &amp; drop</span>
                                <small>PDF or DOCX (Max 5MB)</small>
                            </label>
                            <input ref={resumeFileRef} hidden type="file" name="resume" id="resume" accept=".pdf,.doc,.docx" />
                        </div>

                        <div className="divider">OR</div>

                        <div className="input-group">
                            <label htmlFor="selfDescription" className="field-title">
                                Quick Self-Description
                            </label>
                            <textarea
                                onChange={(e) => { setSelfDescription(e.target.value) }}
                                name="selfDescription"
                                id="selfDescription"
                                placeholder="Briefly describe your experience, key skills, and years of experience if you don't have a resume handy..."
                            />
                        </div>

                        <p className="info-note">
                            Either a Resume or a Self Description is required to generate a
                            personalized plan.
                        </p>
                    </div>
                </div>

                <div className="card-footer">
                    <p>AI-Powered Strategy Generation - Approx 30s</p>
                    <button
                        onClick={handleGenerateReport}
                        className="button primary-button">Generate My Interview Strategy</button>
                </div>
            </section>

            <nav className="home-links" aria-label="footer links">
                <a href="#">Privacy Policy</a>
                <a href="#">Terms of Service</a>
                <a href="#">Help Center</a>
            </nav>
        </main>
    )
}

export default Home;