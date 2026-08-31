// // src/components/Accounting/AdvanceSalaryForm.jsx
// import React, { useEffect, useState } from "react";
// import { Card, Row, Col, Form, Button } from "react-bootstrap";
// import { toast } from "react-toastify";
// import { getBranches } from "../../../services/branchService";
// import { getEmployeesByBranch } from "../../../services/hrmService";
// import expenseService from "../../../services/expensessService";

// const AdvanceSalaryForm = ({ branchId, onCancel, onSuccess }) => {
//   const [branches, setBranches] = useState([]);
//   const [loadingBranches, setLoadingBranches] = useState(false);

//   const [formData, setFormData] = useState({
//     branch_id: branchId || "",
//     employee_id: "",
//     amount: 0,
//     reason: "",
//     month: "",
//   });

//   const [employees, setEmployees] = useState([]);
//   const [loadingEmployees, setLoadingEmployees] = useState(false);

//   // Fetch all branches on mount
//   useEffect(() => {
//     fetchBranches();
//   }, []);

//   const fetchBranches = async () => {
//     setLoadingBranches(true);
//     try {
//       const branchesData = await getBranches();
//       setBranches(branchesData);
//     } catch (error) {
//       console.error("Error fetching branches:", error);
//       setBranches([]);
//     } finally {
//       setLoadingBranches(false);
//     }
//   };

//   // Fetch employees when branch changes
//   useEffect(() => {
//     if (formData.branch_id) fetchEmployees(formData.branch_id);
//   }, [formData.branch_id]);

//   const fetchEmployees = async (branchId) => {
//     setLoadingEmployees(true);
//     try {
//       const empData = await getEmployeesByBranch(branchId);
//       setEmployees(empData);
//     } catch (error) {
//       console.error("Error fetching employees:", error);
//       setEmployees([]);
//     } finally {
//       setLoadingEmployees(false);
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.employee_id) {
//       toast.error("Please select an employee.", { position: "top-right", autoClose: 3000, theme: "colored" });
//       return;
//     }

//     const payload = {
//       branch_id: formData.branch_id,
//       employee_id: formData.employee_id,
//       advance_amount: formData.amount,
//       description: formData.reason,
//       month: formData.month,
//     };

//     try {
//       const response = await expenseService.employeeAdvancePayment(payload);

//       if (response?.success === false) {
//         toast.error(response.message || "Failed to create advance salary.", {
//           position: "top-right",
//           autoClose: 4000,
//           theme: "colored",
//         });
//         return;
//       }

//       toast.success("Advance salary created successfully!", {
//         position: "top-right",
//         autoClose: 3000,
//         theme: "colored",
//       });

//       onSuccess?.();
//     } catch (error) {
//       console.error("Error creating advance salary:", error);
//       toast.error(
//         error.response?.data?.message || error.message || "Failed to create advance salary",
//         { position: "top-right", autoClose: 4000, theme: "colored" }
//       );
//     }
//   };

//   return (
//     <Card className="p-4">
//       <Form onSubmit={handleSubmit}>
//         {/* Branch & Employee */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Label><strong>Site</strong></Form.Label>
//             <Form.Select
//               value={formData.branch_id}
//               onChange={(e) => setFormData({ ...formData, branch_id: e.target.value, employee_id: "" })}
//               required
//               disabled={!!branchId}
//             >
//               <option value="">
//                 {loadingBranches ? "Loading sites..." : "Select Site"}
//               </option>
//               {branches.map((b) => (
//                 <option key={b.id} value={b.id}>
//                   {b.name}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//           <Col md={6}>
//             <Form.Label><strong>Employee</strong></Form.Label>
//             <Form.Select
//               value={formData.employee_id}
//               onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
//               required
//               disabled={!formData.branch_id || loadingEmployees}
//             >
//               <option value="">
//                 {loadingEmployees ? "Loading employees..." : "Select Employee"}
//               </option>
//               {employees.map((emp) => (
//                 <option key={emp.employee_id} value={emp.employee_id}>
//                   {emp.name}
//                 </option>
//               ))}
//             </Form.Select>
//           </Col>
//         </Row>

//         {/* Amount & Month */}
//         <Row className="mb-3">
//           <Col md={6}>
//             <Form.Label><strong>Amount</strong></Form.Label>
//             <Form.Control
//               type="number"
//               value={formData.amount}
//               onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
//               required
//             />
//           </Col>
//           <Col md={6}>
//             <Form.Label><strong>Reason</strong></Form.Label>
//             <Form.Control
//               type="text"
//               value={formData.reason}
//               onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
//               placeholder="Reason for advance salary"
//               required
//             />
//           </Col>
//         </Row>

//         {/* Buttons */}
//         <div className="text-end mt-4">
//           <Button variant="secondary" className="me-2" onClick={onCancel}>
//             Cancel
//           </Button>
//           <Button variant="success" type="submit">Submit Advance Salary</Button>
//         </div>
//       </Form>
//     </Card>
//   );
// };

// export default AdvanceSalaryForm;




// src/components/Accounting/AdvanceSalaryForm.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Form, Button, Spinner } from "react-bootstrap";
import Select from "react-select";
import { toast } from "react-toastify";
import { getBranches } from "../../../services/branchService";
import { getEmployeesByBranch } from "../../../services/hrmService";
import expenseService from "../../../services/expensessService";

const AdvanceSalaryForm = ({ branchId, onCancel, onSuccess }) => {
  const [branches, setBranches] = useState([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const [formData, setFormData] = useState({
    branch_id: branchId || "",
    employee_id: "",
    amount: "",
    reason: "",
    month: "",
  });

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  // Fetch all branches on mount
  useEffect(() => {
    fetchBranches();
  }, []);

  const fetchBranches = async () => {
    setLoadingBranches(true);
    try {
      const branchesData = await getBranches();
      setBranches(branchesData);
    } catch (error) {
      console.error("Error fetching branches:", error);
      setBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  // Fetch employees when branch changes
  useEffect(() => {
    if (formData.branch_id) fetchEmployees(formData.branch_id);
  }, [formData.branch_id]);

  const fetchEmployees = async (branchId) => {
    setLoadingEmployees(true);
    try {
      const empData = await getEmployeesByBranch(branchId);
      setEmployees(empData);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setEmployees([]);
    } finally {
      setLoadingEmployees(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.branch_id) {
      toast.error("Please select a site.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    if (!formData.employee_id) {
      toast.error("Please select an employee.", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
      return;
    }

    const payload = {
      branch_id: formData.branch_id,
      employee_id: formData.employee_id,
      advance_amount: formData.amount,
      description: formData.reason,
      month: formData.month,
    };
    setSubmitting(true);
    try {
      const response = await expenseService.employeeAdvancePayment(payload);

      if (response?.success === false) {
        toast.error(response.message || "Failed to create advance salary.", {
          position: "top-right",
          autoClose: 4000,
          theme: "colored",
        });
        return;
      }

      toast.success("Advance salary created successfully!");

      const createdBranchId =
        response?.data?.expense?.branch_id ||
        response?.data?.branch_id ||
        response?.branch_id ||
        formData.branch_id;
      onSuccess?.(createdBranchId);
    } catch (error) {
      console.error("Error creating advance salary:", error);
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Failed to create advance salary",
        { position: "top-right", autoClose: 4000, theme: "colored" }
      );
    } finally {
      setSubmitting(false); // Add this line
    }
  };

  return (
    <Card className="p-4">
      <Form onSubmit={handleSubmit}>
        {/* Branch & Employee */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>
              <strong>
                Site <span className="text-danger">*</span>
              </strong>
            </Form.Label>
            <Select
              value={
                formData.branch_id
                  ? {
                      value: formData.branch_id,
                      label:
                        branches.find(
                          (b) => String(b.id) === String(formData.branch_id)
                        )?.name || formData.branch_id,
                    }
                  : null
              }
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  branch_id: selected ? selected.value : "",
                  employee_id: "",
                })
              }
              options={branches.map((b) => ({
                value: b.id,
                label: b.name,
              }))}
              placeholder={loadingBranches ? "Loading sites..." : "Select Site..."}
              isLoading={loadingBranches}
              isDisabled={!!branchId}
              isClearable={!branchId}
            />
          </Col>
          <Col md={6}>
            <Form.Label>
              <strong>
                Employee <span className="text-danger">*</span>
              </strong>
            </Form.Label>
            <Select
              value={
                formData.employee_id
                  ? {
                      value: formData.employee_id,
                      label:
                        employees.find(
                          (emp) => String(emp.employee_id) === String(formData.employee_id)
                        )?.name || formData.employee_id,
                    }
                  : null
              }
              onChange={(selected) =>
                setFormData({
                  ...formData,
                  employee_id: selected ? selected.value : "",
                })
              }
              options={employees.map((emp) => ({
                value: emp.employee_id,
                label: emp.name,
              }))}
              placeholder={
                !formData.branch_id
                  ? "Select a site first..."
                  : loadingEmployees
                  ? "Loading employees..."
                  : "Select Employee..."
              }
              isLoading={loadingEmployees}
              isDisabled={!formData.branch_id || loadingEmployees}
              isClearable
            />
          </Col>
        </Row>

        {/* Amount & Month */}
        <Row className="mb-3">
          <Col md={6}>
            <Form.Label>
              <strong>
                Amount<span className="text-danger">*</span>
              </strong>
            </Form.Label>
            <Form.Control
              type="number"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: parseFloat(e.target.value) })
              }
              required
              placeholder="0"
            />
          </Col>
          <Col md={6}>
            <Form.Label>
              <strong>
                Reason <span className="text-danger">*</span>
              </strong>
            </Form.Label>
            <Form.Control
              type="text"
              value={formData.reason}
              onChange={(e) =>
                setFormData({ ...formData, reason: e.target.value })
              }
              placeholder="Reason for advance salary"
              required
            />
          </Col>
        </Row>

        {/* Buttons */}
        <div className="text-end mt-4">
          <Button variant="secondary" className="me-2" onClick={onCancel}>
            Cancel
          </Button>
          {/* <Button variant="success" type="submit">Submit Advance Salary</Button> */}
          <Button variant="success" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  className="me-2"
                  aria-hidden="true"
                />
                Submitting...
              </>
            ) : (
              "Submit Advance Salary"
            )}
          </Button>
        </div>
      </Form>
    </Card>
  );
};

export default AdvanceSalaryForm;
