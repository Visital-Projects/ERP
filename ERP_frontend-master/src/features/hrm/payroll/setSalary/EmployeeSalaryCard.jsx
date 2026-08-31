
import React, { useState, useEffect } from "react";
import { Card, Button } from "react-bootstrap";
import { Plus } from "react-bootstrap-icons";
import SalaryModal from "./SalaryCard";
import { fetchAllAccounts } from "../../../../services/accountService";

const EmployeeSalaryCard = ({ employee, onUpdate, getEmployeeName }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAccountsList();
  }, []);

  const fetchAccountsList = async () => {
    try {
      const data = await fetchAllAccounts();
      setAccounts(data);
    } catch (err) {
      console.error("Error loading accounts:", err);
    } finally {
      setLoading(false);
    }
  };

  const getAccountName = () => {
    if (!employee.account) return "--";

    // Find the account by ID (handle both string and number IDs)
    const account = accounts.find(
      (acc) =>
        acc.id === employee.account || acc.id === parseInt(employee.account)
    );

    return account ? account.account_name : employee.account;
  };

  if (loading) {
    return (
      <Card>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <span>Employee Salary</span>
          <Button variant="primary" size="sm" disabled>
            <Plus size={16} />
          </Button>
        </Card.Header>
        <Card.Body>
          <p>Loading account information...</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card>
      <Card.Header className="d-flex justify-content-between align-items-center">
        <span>Employee Salary</span>
        {/* <Button variant="primary" size="sm" onClick={() => setModalOpen(true)}>
          <Plus size={16} />
        </Button> */}
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip id="tooltip">Add Salary</Tooltip>}
        >
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={16} />
          </Button>
        </OverlayTrigger>
      </Card.Header>
      <Card.Body>
        <p>
          <strong>Payslip Type:</strong> {employee.salary_type_name || "--"}
        </p>
        <p>
          <strong>Salary:</strong> ${employee.salary || "--"}
        </p>
        <p>
          <strong>Account:</strong> {getAccountName()}
        </p>
      </Card.Body>

      {/* <SalaryModal
        show={modalOpen}
        onHide={() => }
        employee={employee}
        onUpdate={onUpdate}
        getEmployeeName={getEmployeeName}
      /> */}
      <SalaryModal
        show={modalOpen}
        onHide={() => {
          /* do nothing here, SalaryCard will handle closing */
        }}
        employee={employee}
        onUpdate={onUpdate}
        getEmployeeName={getEmployeeName}
      />
    </Card>
  );
};

export default EmployeeSalaryCard;
