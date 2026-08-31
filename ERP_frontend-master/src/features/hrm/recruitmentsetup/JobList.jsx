import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getJobs } from "../../../services/recruitmentSetupService";
import { getBranches } from "../../../services/branchService";
import { Button } from "react-bootstrap";
import moment from "moment";
import { FaPlus, FaEye, FaEdit, FaTrash, FaLink } from "react-icons/fa";
import 'bootstrap-icons/font/bootstrap-icons.css';
import "./JobList.css"
 
import { getJobById } from "../../../services/recruitmentSetupService"; // Assuming this exists

const JobList = () => {
  const [jobs, setJobs] = useState([]);
  const [branchMap, setBranchMap] = useState({});
  const navigate = useNavigate();
   const [selectedJob, setSelectedJob] = useState(null);
const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchJobsAndBranches();
  }, []);

  const fetchJobsAndBranches = async () => {
    try {
      const jobsRes = await getJobs();
      const jobsData = Array.isArray(jobsRes?.data) ? jobsRes.data : [];

      console.log("Fetched Jobs:", jobsData); // ✅ Log job data

      const branches = await getBranches();
      console.log("Fetched Branches:", branches); // ✅ Log branch data

      const branchMap = {};
      branches.forEach((branch) => {
        branchMap[branch.id] = branch.name;
      });

      console.log("Branch Map:", branchMap); // ✅ Log mapped branch IDs to names

      setJobs(jobsData);
      setBranchMap(branchMap);
    } catch (error) {
      console.error("Failed to fetch jobs or branches:", error);
    }
  };
   


  const totalJobs = jobs.length;
  const activeJobs = jobs.filter((job) => job.status === "active").length;
  const inactiveJobs = totalJobs - activeJobs;
  


  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h4 className="fw-bold">Manage Job</h4>
          <p className="text-success small mb-0">Dashboard &gt; Job</p>
        </div>
        <Button className="btn btn-success" onClick={() => navigate("/job/create")}>
          <FaPlus className="me-1" /> Create Job
        </Button>
      </div>

      {/* Job Stats */}
      <div className="row mb-4">
  {/* Total Jobs */}
  <div className="col-md-4">
    <div className="job-card total">
      <div className="d-flex align-items-center">
        <div className="icon-box">
          <i className="bi bi-briefcase-fill text-danger fs-5"></i>
        </div>
        <div className="ms-3">
          <small className="text-muted">Total</small>
          <h6 className="mb-0 fw-bold">Jobs</h6>
        </div>
        <div className="ms-auto fw-bold fs-5">{totalJobs}</div>
      </div>
    </div>
  </div>

  {/* Active Jobs */}
  <div className="col-md-4">
    <div className="job-card active">
      <div className="d-flex align-items-center">
        <div className="icon-box">
          <i className="bi bi-patch-check-fill text-success fs-5"></i>
        </div>
        <div className="ms-3">
          <small className="text-muted">Active</small>
          <h6 className="mb-0 fw-bold">Jobs</h6>
        </div>
        <div className="ms-auto fw-bold fs-5">{activeJobs}</div>
      </div>
    </div>
  </div>

  {/* Inactive Jobs */}
  <div className="col-md-4">
    <div className="job-card inactive">
      <div className="d-flex align-items-center">
        <div className="icon-box">
          <i className="bi bi-x-circle-fill text-warning fs-5"></i>
        </div>
        <div className="ms-3">
          <small className="text-muted">Inactive</small>
          <h6 className="mb-0 fw-bold">Jobs</h6>
        </div>
        <div className="ms-auto fw-bold fs-5">{inactiveJobs}</div>
      </div>
    </div>
  </div>
</div>


      {/* Table Controls */}
      

      {/* Job Table */}
      <div className="card shadow-sm rounded p-3">
  {/* Header row: pagination size + search */}
  <div className="d-flex justify-content-between align-items-center mb-4">
    <div>
      <select className="form-select" style={{ width: "80px" }}>
        <option>10</option>
        <option>25</option>
        <option>50</option>
      </select>
    </div>
    <div>
      <input
        type="text"
        className="form-control"
        placeholder="Search..."
        style={{ width: "250px" }}
      />
    </div>
  </div>

  {/* Table */}
  <div className="table-responsive">
    <table className="table table-hover table-bordered">
      <thead className="table-light">
        <tr>
          <th>Branch</th>
          <th>Title</th>
          <th>Start Date</th>
          <th>End Date</th>
          <th>Status</th>
          <th>Created At</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <tr key={job.id}>
              <td>{branchMap[job.branch] || "N/A"}</td>
              <td>{job.title}</td>
              <td>{moment(job.start_date).format("MMM D, YYYY")}</td>
              <td>{moment(job.end_date).format("MMM D, YYYY")}</td>
              <td>
                <span
                  className={`badge bg-${
                    job.status === "active" ? "success" : "secondary"
                  }`}
                >
                  {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                </span>
              </td>
              <td>{moment(job.created_at).format("MMM D, YYYY")}</td>
              <td>
                <div className="d-flex gap-2">
                  <Button variant="dark" size="sm">
                    <FaLink />
                  </Button>
                 <Button
  variant="warning"
  size="sm"
  onClick={() => navigate(`/recruitments/jobs/view/${job.id}`)}
>
  <FaEye />
</Button>


                  <Button variant="info" size="sm" onClick={() => navigate(`/recruitments/jobs/edit/${job.id}`)}>

                    <FaEdit />
                  </Button>
                  <Button variant="danger" size="sm">
                    <FaTrash />
                  </Button>
                </div>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="7" className="text-center">
              No jobs found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>


      {/* Pagination Footer */}
      <div className="mt-3 d-flex justify-content-between align-items-center">
        <span>
          Showing {jobs.length > 0 ? 1 : 0} to {jobs.length} of {jobs.length} entries
        </span>
      </div>
    </div>
  );
};

export default JobList;
