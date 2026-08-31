
import React, { useState, useEffect } from "react";
import { Table, Button, Spinner, OverlayTrigger, Tooltip } from "react-bootstrap";
import { toast } from "react-toastify";
import salaryService from "../../../../services/salaryService";
import OTPayslipModal from "./otpayslipModal";

const OTPayslip = ({ month, year, search, entries, currentPage, onPageChange, onLoading, onDataLoaded, onTotalCount, refreshTrigger }) => {
  const [otPayslips, setOTPayslips] = useState([]);
  const [allOTPayslips, setAllOTPayslips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [otGenerationLoading, setOTGenerationLoading] = useState(false);
  const [otBulkPaymentLoading, setOTBulkPaymentLoading] = useState(false);
  const [viewOTPayslipModal, setViewOTPayslipModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const monthNumber = {
    JAN: "01", FEB: "02", MAR: "03", APR: "04", MAY: "05", JUN: "06",
    JUL: "07", AUG: "08", SEP: "09", OCT: "10", NOV: "11", DEC: "12",
  };

 
// Fetch OT payslips
const fetchOTPayslips = async () => {
  try {
    setLoading(true);
    if (onLoading) onLoading(true);

    const selectedMonth = monthNumber[month];
    const salary_month = `${year}-${selectedMonth}`;

    console.log("🔍 Fetching OT payslips for:", salary_month);
    
    const res = await salaryService.getOTPayslips(1, 1000, salary_month);

    console.log("📦 OT Response:", res);

    // Check if response has data
    let hasData = false;
    
    if (res && res.success === true) {
      if (res.data && res.data.length > 0) {
        // ✅ Has data - format and set
        const formattedData = res.data.map((p) => ({
          ...p,
          id: p.employee_id ? `#EMP${String(p.employee_id).padStart(5, "0")}` : "N/A",
          rawId: p.employee_id,
          name: p.employee?.name || "N/A",
          branch: p.employee?.branch?.name || "-",
          department: p.employee?.department?.name || "-",
          status: p.status === "paid" ? "Paid" : "Unpaid",
          ot_hours: p.ot_hour || 0,
          ot_rate: p.ot_rate || 0,
          ot_amount: p.ot_payment || 0,
          salaryDate: p.salary_month,
        }));
        setAllOTPayslips(formattedData);
        setOTPayslips(formattedData);
        hasData = true;
      } else {
        // ❌ No data - empty array
        setAllOTPayslips([]);
        setOTPayslips([]);
        hasData = false;
      }
    } else if (res && res.message === "OT salary payslips already generated for this month") {
      // This is actually an error case but we need to check if there's data
      // The backend might return success: false with this message
      // Try to fetch again with different parameters or assume no data yet
      console.log("⚠️ OT payslips might not exist yet");
      setAllOTPayslips([]);
      setOTPayslips([]);
      hasData = false;
    } else {
      // ❌ Error or no data
      setAllOTPayslips([]);
      setOTPayslips([]);
      hasData = false;
    }
    
    // ✅ IMPORTANT: Only set onDataLoaded to true if we actually have data
    if (onDataLoaded) {
      onDataLoaded(hasData);
    }
    
  } catch (err) {
    console.error("Error fetching OT payslips:", err);
    setAllOTPayslips([]);
    setOTPayslips([]);
    
    // ❌ On error, always set to false (no data)
    if (onDataLoaded) {
      onDataLoaded(false);
    }
    
    // Don't show toast for 404 - it's normal when no data exists
    if (err.response?.status !== 404) {
      toast.error("Failed to fetch OT payslips");
    }
  } finally {
    setLoading(false);
    if (onLoading) onLoading(false);
  }
};

  // Generate OT payslips
  const handleGenerateOTPayslip = async () => {
    setOTGenerationLoading(true);

    const selectedMonth = monthNumber[month];

    try {
      const res = await salaryService.bulkGenerateOTPayslips({
        month: selectedMonth,
        year: year,
      });

      if (res.success) {
        toast.success(`✅ Generated ${res.total_generated || 0} OT payslips`);
        await fetchOTPayslips();
      } else {
        toast.error(res.message || "Failed to generate OT payslip");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Generation failed");
    } finally {
      setOTGenerationLoading(false);
    }
  };

  // Bulk OT payment
  const handleOTBulkPayment = async () => {
    const selectedMonth = monthNumber[month];
    const salaryMonth = `${year}-${selectedMonth}`;

    const unpaidCount = filteredOTEmployees.filter(emp => emp.status === "Unpaid").length;

    if (unpaidCount === 0) {
      toast.info("No unpaid OT payslips found");
      return;
    }

    if (window.confirm(`Pay ${unpaidCount} OT payslips for ${month} ${year}?`)) {
      try {
        setOTBulkPaymentLoading(true);
        const res = await salaryService.bulkOTPayment(salaryMonth);

        if (res.success) {
          toast.success(`✅ OT Payment processed: ${res.summary?.total_paid_employees} employees paid`);
          await fetchOTPayslips();
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Payment failed");
      } finally {
        setOTBulkPaymentLoading(false);
      }
    }
  };

  // Filter and paginate
  const filteredOTEmployees = React.useMemo(() => {
    if (!month) return [];

    const selectedMonth = monthNumber[month];
    const selectedDate = `${year}-${selectedMonth}`;

    const monthFiltered = allOTPayslips.filter(emp =>
      emp.salaryDate && emp.salaryDate.startsWith(selectedDate)
    );

    const searchFiltered = monthFiltered.filter(emp =>
      emp.name?.toLowerCase().includes(search.toLowerCase()) ||
      emp.id?.toLowerCase().includes(search.toLowerCase())
    );

    return searchFiltered;
  }, [allOTPayslips, month, year, search]);

  // Update parent with count whenever filtered data changes
  useEffect(() => {
    if (onTotalCount) {
      onTotalCount(filteredOTEmployees.length);
    }
  }, [filteredOTEmployees.length, onTotalCount]);

  const startIndex = (currentPage - 1) * entries;
  const currentData = filteredOTEmployees.slice(startIndex, startIndex + entries);
  const pageCount = Math.ceil(filteredOTEmployees.length / entries);

  // Delete OT payslip
  const handleDelete = async (id) => {
    if (window.confirm("Delete this OT payslip?")) {
      try {
        await salaryService.softDeleteOTPayslip(id);
        toast.success("OT payslip deleted");
        await fetchOTPayslips();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  // Fetch data when month, year, or refreshTrigger changes
  useEffect(() => {
    fetchOTPayslips();
  }, [month, year, refreshTrigger]); // Added refreshTrigger here

  if (loading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="warning" />
        <p className="mt-2">Loading OT data...</p>
      </div>
    );
  }

  if (filteredOTEmployees.length === 0) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-file-earmark-text display-1 text-muted"></i>
        <h5 className="text-muted mt-3">No OT Payslips Found</h5>
        <p className="text-muted">No overtime data found for {month} {year}</p>
        <Button
          variant="warning"
          size="lg"
          onClick={handleGenerateOTPayslip}
          disabled={otGenerationLoading}
        >
          {otGenerationLoading ? (
            <><Spinner size="sm" /> Generating...</>
          ) : (
            `Generate OT Payslips for ${month} ${year}`
          )}
        </Button>
      </div>
    );
  }

  return (
    <>
      <Table hover responsive striped>
        <thead>
          <tr>
            <th>EMPLOYEE ID</th>
            <th>NAME</th>
            <th>SITE</th>
            <th>DEPARTMENT</th>
            <th>OT HOURS</th>
            <th>OT RATE</th>
            <th>OT AMOUNT</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {currentData.map((emp, idx) => (
            <tr key={idx}>
              <td>
                <Button variant="outline-success" size="sm">
                  {emp.id}
                </Button>
              </td>
              <td>{emp.name}</td>
              <td>{emp.branch}</td>
              <td>{emp.department}</td>
              <td>{emp.ot_hours.toFixed(2)}</td>
              <td>₹{emp.ot_rate.toFixed(2)}</td>
              <td>₹{emp.ot_amount.toFixed(2)}</td>
              <td>
                <Button size="sm" variant={emp.status === "Paid" ? "success" : "warning"}>
                  {emp.status}
                </Button>
              </td>
              <td>
                <OverlayTrigger placement="top" overlay={<Tooltip>View OT Details</Tooltip>}>
                  <Button
                    size="sm"
                    variant="warning"
                    className="me-2"
                    onClick={() => {
                      setSelectedEmployee(emp);
                      setViewOTPayslipModal(true);
                    }}
                  >
                    <i className="bi bi-file-earmark-text"></i>
                  </Button>
                </OverlayTrigger>
                <OverlayTrigger placement="top" overlay={<Tooltip>Delete</Tooltip>}>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleDelete(emp.id)}
                  >
                    <i className="bi bi-trash"></i>
                  </Button>
                </OverlayTrigger>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <OTPayslipModal
        show={viewOTPayslipModal}
        onHide={() => setViewOTPayslipModal(false)}
        employee={selectedEmployee}
        onOTUpdated={fetchOTPayslips}
      />
    </>
  );
};

export default OTPayslip;