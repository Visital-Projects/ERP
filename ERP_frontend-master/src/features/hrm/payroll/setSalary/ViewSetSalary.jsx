// import React, { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { Spinner } from "react-bootstrap";
// import { useSelector } from "react-redux";
// import { selectEmployees } from "../../../../redux/slices/hrmSlice";

// import SalaryCard from "./SalaryCard";
// import AllowanceCard from "./AllowanceCard";
// import CommissionCard from "./CommissionCard";
// import LoanCard from "./LoanCard";
// import SaturationCard from "./SaturationCard";
// import OtherPaymentCard from "./OtherPaymentCard";
// import OvertimeCard from "./OvertimeCard";
// import apiClient from "../../../../services/apiClient";

// const ViewSetSalary = () => {
//   const { id } = useParams();
//   const [employee, setEmployee] = useState(null);
//   const employees = useSelector(selectEmployees);

//   const getEmployeeName = (id) => {
//     const emp = employees.find((e) => e.id === id);
//     return emp ? emp.name : "--";
//   };

//   const fetchEmployee = async () => {
//     try {
//       const res = await apiClient.get(`/employees/${id}`);
//       setEmployee(res.data);
//     } catch (err) {
//       console.error("Error fetching employee", err);
//     }
//   };

//   useEffect(() => {
//     fetchEmployee();
//   }, [id]);

//   if (!employee) return;

//   return (
//     <div className="container-fluid p-4">
//       <h2 className="mb-4">Employee Set Salary</h2>
//       <div className="row">
//         <div className="col-md-6 mb-4" style={{ height: "340px" }}>
//           <SalaryCard employee={employee} fetchEmployee={fetchEmployee} />
//         </div>
//         <div className="col-md-6 mb-4">
//           <AllowanceCard
//             employee={employee}
//             getEmployeeName={getEmployeeName}
//           />
//         </div>
//         <div className="col-md-6 mb-4">
//           <CommissionCard
//             employee={employee}
//             getEmployeeName={getEmployeeName}
//           />
//         </div>
//         <div className="col-md-6 mb-4">
//           <LoanCard employee={employee} />
//         </div>
//         <div className="col-md-6 mb-4">
//           <SaturationCard employee={employee} /> {/* ✅ fixed */}
//         </div>
//         <div className="col-md-6 mb-4">
//           <OtherPaymentCard employee={employee} /> {/* ✅ fixed */}
//         </div>
//         <div className="col-md-6 mb-4">
//           <OvertimeCard employee={employee} /> {/* ✅ fixed */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ViewSetSalary;
// // ++++++++++++++++++++

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spinner, Alert } from "react-bootstrap";
import { useSelector } from "react-redux";
import { selectEmployees } from "../../../../redux/slices/hrmSlice";

import SalaryCard from "./SalaryCard";
import AllowanceCard from "./AllowanceCard";
import CommissionCard from "./CommissionCard";
import LoanCard from "./LoanCard";
import SaturationCard from "./SaturationCard";
import OtherPaymentCard from "./OtherPaymentCard";
import OvertimeCard from "./OvertimeCard";
import apiClient from "../../../../services/apiClient";
import BreadCrumb from "../../../../components/BreadCrumb";

const ViewSetSalary = () => {
  const { id } = useParams();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const employees = useSelector(selectEmployees);
  const navigate = useNavigate();
  const getEmployeeName = (id) => {
    if (!employees || !Array.isArray(employees)) return "--";
    const emp = employees.find((e) => e.id === id);
    return emp ? emp.name : "--";
  };

  // const fetchEmployee = async () => {
  //   try {
  //     setLoading(true);
  //     setError(null);
  //     const res = await apiClient.get(`/employees/${id}`);
  //     setEmployee(res.data);
  //   } catch (err) {
  //     console.error("Error fetching employee", err);
  //     setError(err.response?.data?.message || "Failed to fetch employee data");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchEmployee = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await apiClient.get(`/employees/${id}`);
      setEmployee(res.data.data);

      // ✅ ADD THIS DEBUG LOG
      console.log("Employee data:", res.data);
      console.log("Employee ID fields:", {
        databaseId: res.data?.id,
        businessId: res.data?.employee_id,
        hasEmployeeId: !!res.data?.employee_id,
      });
    } catch (err) {
      console.error("Error fetching employee", err);
      setError(err.response?.data?.message || "Failed to fetch employee data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployee();
  }, [id]);

  if (loading) {
    return (
      <div className="container-fluid p-4 text-center d-flex flex-column justify-content-center align-items-center" style={{height:"40vh"}}>
        <Spinner animation="border" role="status" className="my-4" variant="success">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
        <p className="text-success">Loading employee data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid p-4">
        <Alert variant="danger" className="my-4">
          <Alert.Heading>Error Loading Employee</Alert.Heading>
          <p>{error}</p>
          <hr />
          <div className="d-flex justify-content-end">
            <Button
              onClick={() => window.history.back()}
              variant="outline-danger"
            >
              Go Back
            </Button>
            <Button onClick={fetchEmployee} variant="danger" className="ms-2">
              Try Again
            </Button>
          </div>
        </Alert>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="container-fluid p-4">
        <Alert variant="warning" className="my-4">
          <Alert.Heading>Employee Not Found</Alert.Heading>
          <p>The requested employee could not be found.</p>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container-fluid p-4">
      <div className="pb-2 mb-2">
        <h2 className="">Employee Set Salary: {employee.name}</h2>
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>
      <div className="row">
        <div className="col-md-6 mb-4" style={{ minHeight: "340px" }}>
          {/* <SalaryCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
            fetchEmployee={fetchEmployee}
          /> */}

          <SalaryCard
            employee={employee} // ✅ Pass full object, not just ID
            fetchEmployee={fetchEmployee}
          />
        </div>
        <div className="col-md-6 mb-4">
          <AllowanceCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
        <div className="col-md-6 mb-4">
          <CommissionCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
        <div className="col-md-6 mb-4">
          <LoanCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
        <div className="col-md-6 mb-4">
          <SaturationCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
        <div className="col-md-6 mb-4">
          <OtherPaymentCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
        <div className="col-md-6 mb-4">
          <OvertimeCard
            employeeId={employee?.employee_id} // ✅ now it's defined
            employeeName={employee?.name}
          />
        </div>
      </div>
    </div>
  );
};

export default ViewSetSalary;
