// import React, { useEffect, useState } from "react";
// import { Table, Card, Spinner, Alert } from "react-bootstrap";
// import { useParams, useLocation } from "react-router-dom";
// import manpowerReportService from "../../services/manpowerReportService";

// const ManpowerReport = () => {
//   const { branchId } = useParams();
//   const location = useLocation();
//   const branchName = location.state?.branchName || "Branch Report";

//   const [reportData, setReportData] = useState([]);
//   const [months, setMonths] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!branchId) return;

//     const fetchReport = async () => {
//       setLoading(true);
//       try {
//         const data = await manpowerReportService.getReportByBranch(branchId);
//         if (data.success) {
//           setMonths(data.data.months);
//           setReportData(data.data.report);
//         } else {
//           setError("Failed to fetch report");
//         }
//       } catch (err) {
//         setError("Something went wrong while fetching report");
//       }
//       setLoading(false);
//     };

//     fetchReport();
//   }, [branchId]);

// if (loading)
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "60vh",
//       }}
//     >
//       <Spinner animation="border" />
//     </div>
//   );
// if (error)
//   return (
//     <div
//       style={{
//         display: "flex",
//         justifyContent: "center",
//         alignItems: "center",
//         height: "60vh",
//       }}
//     >
//       <Alert variant="danger">{error}</Alert>
//     </div>
//   );

//   return (
//     <div className="container-fluid py-3 my-4">
//       <h3>{branchName} - Manpower Report</h3>
//       {months.length > 0 && <p>Month(s): {months.join(", ")}</p>}

//       {reportData.map((branch) => (
//         <Card key={branch.branchId} className="mb-3">
//           <Card.Header>{branch.branchName}</Card.Header>
//           <Card.Body>
//             {branch.departments.map((dept) => (
//               <div key={dept.id} className="mb-3">
//                 <h5>{dept.name}</h5>
//                 <Table hover size="sm">
//                   <thead>
//                     <tr>
//                       <th>Month</th>
//                       <th>Qty</th>
//                       <th>Total Salary</th>
//                       <th>Average Per Head</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {dept.rows.map((row, index) => (
//                       <tr key={index}>
//                         <td>{row.month}</td>
//                         <td>{row.qty}</td>
//                         <td>{row.totalSalary}</td>
//                         <td>{row.averagePerHead}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </Table>
//               </div>
//             ))}
//           </Card.Body>
//         </Card>
//       ))}
//     </div>
//   );
// };

// export default ManpowerReport;


import React, { useEffect, useState } from "react";
import { Table, Card, Spinner, Alert } from "react-bootstrap";
import { useParams, useLocation } from "react-router-dom";
import manpowerReportService from "../../services/manpowerReportService";

const ALL_MONTHS = ["January 2025","February 2025","March 2025","April 2025","May 2025","June 2025","July 2025","August 2025","September 2025","October 2025","November 2025","December 2025",];

const formatINR = (value) => {
  if (!value || isNaN(value)) return null;
  return (
    "₹ " +
    Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
};

const ManpowerReport = () => {
  const { branchId } = useParams();
  const location = useLocation();
  const branchName = location.state?.branchName || "Branch Report";

  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!branchId) return;

    const fetchReport = async () => {
      setLoading(true);
      try {
        const data = await manpowerReportService.getReportByBranch(branchId);
        if (data.success) {
          setReportData(data.data.report);
        } else {
          setError("Failed to fetch report");
        }
      } catch (err) {
        setError("Something went wrong while fetching report");
      }
      setLoading(false);
    };

    fetchReport();
  }, [branchId]);

  if (loading)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}><Spinner animation="border" /></div>
    );

  if (error)
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}><Alert variant="danger">{error}</Alert></div>
    );

  return (
    <div className="container-fluid py-3 my-4">
      <h3>{branchName} - Manpower Report</h3>

      {reportData.map((branch) => (
        <Card key={branch.branchId} className="mb-4 shadow-sm">
          <Card.Header className="fw-bold">{branch.branchName}</Card.Header>
          <Card.Body>
            <Table hover responsive size="sm">
              <thead className="table-light">
                <tr>
                  <th style={{ width: "220px" }}>Department</th>
                  <th>Type</th>
                  {ALL_MONTHS.map((month) => (<th key={month}>{month.split(" ")[0].slice(0, 3)}</th>))}
                </tr>
              </thead>
              <tbody>
                {branch.departments.map((dept) => {
                  const monthData = {};
                  dept.rows.forEach((row) => {
                    monthData[row.month] = {
                      qty: row.qty || null,
                      totalSalary: row.totalSalary || null,
                      averagePerHead: row.averagePerHead || null,
                    };
                  });

                  return (
                    <React.Fragment key={dept.id}>
                      <tr>
                        <td rowSpan={3} className="align-middle fw-semibold">
                          {dept.name}
                        </td>
                        <td className="ps-3">Quantity</td>
                        {ALL_MONTHS.map((month) => (
                          <td key={month}>{monthData[month]?.qty ?? null}</td>
                        ))}
                      </tr>

                      <tr>
                        <td className="ps-3">Total Salary</td>
                        {ALL_MONTHS.map((month) => (
                          <td key={month}>
                            {formatINR(monthData[month]?.totalSalary)}
                          </td>
                        ))}
                      </tr>

                      <tr>
                        <td className="ps-3">Average Per Head</td>
                        {ALL_MONTHS.map((month) => (
                          <td key={month}>
                            {formatINR(monthData[month]?.averagePerHead)}
                          </td>
                        ))}
                      </tr>
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      ))}
    </div>
  );
};

export default ManpowerReport;
