import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router";
import "../style/Interview.scss";
import { useInterview } from "../hook/useinterview";

const sectionConfig = [
    {
        key: "technicalQuestions",
        label: "Technical Questions"
    },
    {
        key: "behavioralQuestions",
        label: "Behavioral Questions"
    },
    {
        key: "preperationPlan",
        label: "Road Map"
    }
];

const fallbackInterviewReport = {
    matchScore: 0,
    technicalQuestions: [],
    behavioralQuestions: [],
    skillGaps: [],
    preperationPlan: []
};

const Interview = () => {
    const [activeSection, setActiveSection] = useState("technicalQuestions");
    const [expandedQuestion, setExpandedQuestion] = useState(0);
    const { report, getReportById, loading } = useInterview();
    const { interviewId } = useParams();

    const interviewReport = report || fallbackInterviewReport;

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId, getReportById]);

    useEffect(() => {
        setExpandedQuestion(0);
    }, [activeSection]);

    const currentItems = useMemo(() => {
        if (activeSection === "preperationPlan") {
            return interviewReport.preperationPlan || [];
        }
        return interviewReport[activeSection] || [];
    }, [activeSection, interviewReport]);

    const roadmapItems = useMemo(() => {
        const source = Array.isArray(interviewReport.preperationPlan)
            ? interviewReport.preperationPlan
            : Array.isArray(interviewReport.preparationPlan)
                ? interviewReport.preparationPlan
                : [];

        return source.map((item, index) => ({
            day: item.day || `Day ${index + 1}`,
            title: item.title || item.topic || item.focus || `Focus Session ${index + 1}`,
            tasks: Array.isArray(item.tasks)
                ? item.tasks
                : Array.isArray(item.items)
                    ? item.items
                    : []
        }));
    }, [interviewReport]);

    const score = Number.isFinite(interviewReport.matchScore) ? interviewReport.matchScore : 0;
    const scoreMeta = useMemo(() => {
        if (score >= 85) {
            return { text: "Strong match for this role", tone: "strong" };
        }
        if (score >= 55) {
            return { text: "Moderate match with room to improve", tone: "medium" };
        }
        return { text: "Low match right now, focus on skill gaps", tone: "weak" };
    }, [score]);

    const activeLabel = sectionConfig.find((section) => section.key === activeSection)?.label || "Interview";

    if (loading) {
        return (
            <div className="loading-overlay">
                <div className="spinner" aria-label="Loading..." />
                <p>Loading your interview report...</p>
            </div>
        );
    }

    return (
        <main className="interview-page">
            <section className="interview-shell">
                <aside className="interview-left-panel">
                    <p className="panel-heading">Sections</p>

                    <div className="section-links" role="tablist" aria-label="Interview report sections">
                        {sectionConfig.map((section, index) => (
                            <button
                                key={section.key}
                                type="button"
                                role="tab"
                                aria-selected={activeSection === section.key}
                                className={`section-link ${activeSection === section.key ? "active" : ""}`}
                                onClick={() => setActiveSection(section.key)}
                            >
                                <span className="section-icon" aria-hidden="true">{index + 1}</span>
                                {section.label}
                            </button>
                        ))}
                    </div>
                </aside>

                <section className="interview-main-panel">
                    <header className="content-header">
                        <div className="title-row">
                            <h1>{activeLabel}</h1>
                            {activeSection !== "preperationPlan" && <span className="count-pill">{currentItems.length} questions</span>}
                            {activeSection === "preperationPlan" && <span className="count-pill">{roadmapItems.length}-day plan</span>}
                        </div>
                    </header>

                    {activeSection === "preperationPlan" ? (
                        roadmapItems.length ? (
                            <div className="roadmap-timeline" role="list" aria-label="Preparation roadmap timeline">
                                {roadmapItems.map((item) => (
                                    <article className="roadmap-item" key={item.day} role="listitem">
                                        <div className="timeline-dot" aria-hidden="true" />
                                        <div className="roadmap-content">
                                            <div className="roadmap-title-row">
                                                <span className="day-pill">{item.day}</span>
                                                <h2>{item.title}</h2>
                                            </div>

                                            <ul>
                                                {item.tasks.map((task) => (
                                                    <li key={task}>{task}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <div className="roadmap-empty">
                                <p>No roadmap generated for this interview yet.</p>
                            </div>
                        )
                    ) : (
                        <div className="question-list">
                            {currentItems.map((item, index) => (
                                <article className="question-card" key={`${activeSection}-${index}`}>
                                    <button
                                        type="button"
                                        className="question-toggle"
                                        onClick={() => setExpandedQuestion(index)}
                                        aria-expanded={expandedQuestion === index}
                                    >
                                        <span className="q-index">Q{String(index + 1).padStart(2, "0")}</span>
                                        <h2>{item.question}</h2>
                                        <span className={`chevron ${expandedQuestion === index ? "open" : ""}`} aria-hidden="true">
                                            ▾
                                        </span>
                                    </button>

                                    {expandedQuestion === index && (
                                        <div className="question-body">
                                            <div className="answer-block">
                                                <h3>Intention</h3>
                                                <p>{item.intention}</p>
                                            </div>

                                            <div className="answer-block">
                                                <h3>Model Answer</h3>
                                                <p>{item.answer}</p>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            ))}
                        </div>
                    )}
                </section>

                <aside className="interview-right-panel">
                    <div className="match-score-card" aria-live="polite">
                        <p className="side-heading">Match score</p>
                        <div className="score-ring" style={{ "--score": score }}>
                            <div className="score-inner">
                                <strong>{score}</strong>
                                <span>%</span>
                            </div>
                        </div>
                        <p className={`score-note ${scoreMeta.tone}`}>{scoreMeta.text}</p>
                    </div>

                    <div className="right-header">
                        <p className="side-heading">Skill Gaps</p>
                    </div>

                    <div className="skill-gap-list">
                        {(interviewReport.skillGaps || []).map((item) => (
                            <article className="skill-gap-item" key={item.skill}>
                                <span className={`severity-chip ${item.severity}`}>{item.skill}</span>
                            </article>
                        ))}
                    </div>
                </aside>
            </section>
        </main>
    );
};

export default Interview;
