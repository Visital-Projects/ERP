import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getBranches } from "../../../services/branchService";
import { getJobById } from "../../../services/recruitmentSetupService";
import { getJobCategories } from "../../../services/jobCategoryService";
import { getCustomQuestions } from "../../../services/recruitmentSetupService";
import { Badge, Button } from "react-bootstrap";
import moment from "moment";

const JobDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [job, setJob] = useState(null);
  const [branchMap, setBranchMap] = useState({});
  const [categoryMap, setCategoryMap] = useState({});
  const [customQuestionMap, setCustomQuestionMap] = useState({});

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
  try {
    const [jobRes, branchRes, categoryRes, questionRes] = await Promise.all([
      getJobById(id),
      getBranches(),
      getJobCategories(),
      getCustomQuestions(),
    ]);

    const jobData = jobRes?.data;
    if (!jobData) {
      console.error("Job data not found");
      return;
    }

    setJob(jobData);

    const branchMapping = {};
    branchRes.forEach((branch) => {
      branchMapping[branch.id] = branch.name;
    });
    setBranchMap(branchMapping);

    const categoryMapping = {};
    categoryRes?.data?.forEach((cat) => {
      categoryMapping[cat.id] = cat.title;
    });
    setCategoryMap(categoryMapping);

    // ✅ FIXED: Map custom question ID to the actual question string
    const customMap = {};
    questionRes?.data?.forEach((question) => {
      customMap[question.id] = question.question;
    });
    setCustomQuestionMap(customMap);

  } catch (error) {
    console.error("Failed to load job details:", error);
  }
};


  if (!job) return <div className="container mt-5">Loading...</div>;

  const applicantFields = job.applicant?.split(",").filter(Boolean) || [];
  const visibilityFields = job.visibility?.split(",").filter(Boolean) || [];
  const skills = job.skill?.split(",").filter(Boolean) || [];

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h4 className="fw-bold">Job Details</h4>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          Back
        </Button>
      </div>

      <div className="row">
        {/* Left Column */}
        <div className="col-md-6">
          <div className="card p-3 mb-3 shadow-sm">
            <p><strong>Job Title:</strong> {job.title}</p>
            <p><strong>Branch:</strong> {branchMap[job.branch] || "N/A"}</p>
            <p><strong>Job Category:</strong> {categoryMap[job.category] || "N/A"}</p>
            <p><strong>Positions:</strong> {job.position}</p>
            <p>
              <strong>Status:</strong>{" "}
              <Badge bg={job.status === "active" ? "success" : "secondary"}>
                {job.status}
              </Badge>
            </p>
            <p><strong>Created Date:</strong> {moment(job.created_at).format("MMM D, YYYY")}</p>
            <p><strong>Start Date:</strong> {moment(job.start_date).format("MMM D, YYYY")}</p>
            <p><strong>End Date:</strong> {moment(job.end_date).format("MMM D, YYYY")}</p>
            <p><strong>Skills:</strong></p>
            <div className="d-flex flex-wrap gap-1">
              {skills.map((skill, index) => (
                <Badge bg="success" key={index}>{skill}</Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="col-md-6">
          <div className="card p-3 shadow-sm">
            <p><strong>Need to ask?</strong></p>
            <ul>
              {applicantFields.map((field, idx) => (
                <li key={idx}>{field}</li>
              ))}
            </ul>

         <p><strong>Custom Questions:</strong></p>
<ul>
  {(job.custom_question?.split(",") || []).map((id, idx) => (
    <li key={idx}>{customQuestionMap[id.trim()] || `Question ID ${id} not found`}</li>
  ))}
</ul>




            <p><strong>Job Description</strong></p>
            <div dangerouslySetInnerHTML={{ __html: job.description }} />

            <p className="mt-3"><strong>Job Requirement</strong></p>
            <div dangerouslySetInnerHTML={{ __html: job.requirement }} />

            <p className="mt-3"><strong>Need to show option?</strong></p>
            <ul>
              {visibilityFields.map((field, idx) => (
                <li key={idx}>{field}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetailsPage;
