import React, { useEffect, useState } from "react";
import {
  createJob,
  getCustomQuestions,
} from "../../../services/recruitmentSetupService";
import { getBranches } from "../../../services/branchService";
import { getJobCategories } from "../../../services/jobCategoryService";

import { Form, Button, Row, Col, Card, Badge } from "react-bootstrap";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate } from "react-router-dom";
const JobCreate = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    requirement: "",
    branch: "",
    category: "",
    skill: "",
    position: "",
    start_date: "",
    end_date: "",
    status: "active",
    applicant: "",
    visibility: "all",
    created_by: 2,
    code: "",
    custom_question: [],
  });

  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [customQuestions, setCustomQuestions] = useState([]);
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");
const navigate = useNavigate();
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [branchesRes, categoriesRes, questionsRes] = await Promise.all([
          getBranches(),
          getJobCategories(),
          getCustomQuestions(),
        ]);

        setBranches(Array.isArray(branchesRes) ? branchesRes : []);
        setCategories(Array.isArray(categoriesRes?.data) ? categoriesRes.data : []);
        setCustomQuestions(Array.isArray(questionsRes?.data) ? questionsRes.data : []);
      } catch (error) {
        console.error("Error fetching dropdown data", error);
      }
    };
    fetchData();
  }, []);

  const handleCheckbox = (key, value) => {
    const updated = form[key].includes(value)
      ? form[key].replace(value + ",", "")
      : form[key] + value + ",";
    setForm({ ...form, [key]: updated });
  };

  const handleSkillAdd = (e) => {
    if (e.key === "Enter" && skillInput.trim()) {
      e.preventDefault();
      setSkills([...skills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const removeSkill = (skill) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      skill: skills.join(","),
      custom_question: form.custom_question.join(","),
    };
    try {
      await createJob(payload);
      alert("Job created successfully!");
    } catch (error) {
      console.error("Job creation failed:", error);
      alert("Job creation failed!");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold">Create Job</h4>
          <p className="text-success small mb-0">Dashboard &gt; Job &gt; Job Create</p>
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Job Title*</Form.Label>
                      <Form.Control
                        required
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        placeholder="Enter Job Title"
                      />
                    </Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Branch</Form.Label>
  <Form.Select
    required
    value={form.branch}
    onChange={(e) => setForm({ ...form, branch: e.target.value })}
  >
    <option value="">-- Select Branch --</option>
    {branches.map((b) => (
      <option key={b.id} value={b.id}>
        {b.name}
      </option>
    ))}
  </Form.Select>
  <small className="text-muted">
    Create branch here.{" "}
    <span
      style={{ color: "green", cursor: "pointer" }}
      onClick={() => navigate("/hrmsystemsetup/branch")}
    >
      Create branch
    </span>
  </small>
</Form.Group>

<Form.Group className="mb-3">
  <Form.Label>Job Category</Form.Label>
  <Form.Select
    required
    value={form.category}
    onChange={(e) => setForm({ ...form, category: e.target.value })}
  >
    <option value="">-- Select Category --</option>
    {categories.map((c) => (
      <option key={c.id} value={c.id}>
        {c.title}
      </option>
    ))}
  </Form.Select>
  <small className="text-muted">
    Create job category here.{" "}
    <span
      style={{ color: "green", cursor: "pointer" }}
      onClick={() => navigate("/hrmsystemsetup/job-catagory")}
    >
      Create job category
    </span>
  </small>
</Form.Group>



                    <Form.Group className="mb-3">
                      <Form.Label>Positions*</Form.Label>
                      <Form.Control
                        type="number"
                        value={form.position}
                        onChange={(e) => setForm({ ...form, position: e.target.value })}
                        placeholder="Enter Positions"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Status*</Form.Label>
                      <Form.Select
                        value={form.status}
                        onChange={(e) => setForm({ ...form, status: e.target.value })}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </Form.Select>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Start Date*</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.start_date}
                        onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>End Date*</Form.Label>
                      <Form.Control
                        type="date"
                        value={form.end_date}
                        onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                      />
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label>Skills*</Form.Label>
                      <div className="d-flex flex-wrap gap-2 mb-2">
                        {skills.map((skill, i) => (
                          <Badge
                            key={i}
                            bg="primary"
                            className="px-2"
                            style={{ cursor: "pointer" }}
                            onClick={() => removeSkill(skill)}
                          >
                            {skill} &times;
                          </Badge>
                        ))}
                      </div>
                      <Form.Control
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillAdd}
                        placeholder="Type skill and press Enter"
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <h6 className="fw-bold mb-3">Need to Ask?</h6>
                    {["gender", "dob", "country"].map((field) => (
                      <Form.Check
                        key={field}
                        type="checkbox"
                        label={field.charAt(0).toUpperCase() + field.slice(1)}
                        onChange={() => handleCheckbox("applicant", field)}
                      />
                    ))}

                    <hr />
                    <h6 className="fw-bold">Custom Questions</h6>
                    {customQuestions.length > 0 ? (
                      customQuestions.map((q) => (
                        <Form.Check
                          key={q.id}
                          label={q.question}
                          value={q.id}
                          checked={form.custom_question.includes(q.id)}
                          onChange={(e) => {
                            const id = parseInt(e.target.value);
                            setForm((prev) => ({
                              ...prev,
                              custom_question: prev.custom_question.includes(id)
                                ? prev.custom_question.filter((qid) => qid !== id)
                                : [...prev.custom_question, id],
                            }));
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-muted">No custom questions available</p>
                    )}
                  </Col>

                  <Col md={6}>
                    <h6 className="fw-bold mb-3">Need to Show Option?</h6>
                    <Row>
                      {["profile_image", "resume", "cover_letter", "terms"].map((opt) => (
                        <Col md={6} key={opt}>
                          <Form.Check
                            type="checkbox"
                            label={opt
                              .split("_")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                            onChange={() => handleCheckbox("visibility", opt)}
                          />
                        </Col>
                      ))}
                    </Row>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Job Description</Form.Label>
                  <div style={{ border: "1px solid #ced4da", borderRadius: 4, padding: 8 }}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.description}
                      onChange={(event, editor) =>
                        setForm({ ...form, description: editor.getData() })
                      }
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="mb-4">
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Job Requirement</Form.Label>
                  <div style={{ border: "1px solid #ced4da", borderRadius: 4, padding: 8 }}>
                    <CKEditor
                      editor={ClassicEditor}
                      data={form.requirement}
                      onChange={(event, editor) =>
                        setForm({ ...form, requirement: editor.getData() })
                      }
                    />
                  </div>
                </Form.Group>
              </Card.Body>
            </Card>
          </Col>
        </Row>

        <div className="text-end mt-4">
          <Button variant="success" type="submit">
            Create Job
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default JobCreate;
