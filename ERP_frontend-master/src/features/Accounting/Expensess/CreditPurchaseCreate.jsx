import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BreadCrumb from "../../../components/BreadCrumb";
import CreditPurchaseForm from "./CreditPurchaseForm";
import creditPurchaseService from "../../../services/expensessService";
import { redirectToRepresentativeBranchWallet } from "../Banking/walletAccountingHelpers";
import { toast } from "react-toastify";

const CreditPurchaseCreate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id: routeId } = useParams();

  const [existingPurchase, setExistingPurchase] = useState(null);
  const purchaseId = routeId || location.state?.purchaseId;

  const initialBranchId = location.state?.branchId || "";
  const initialAmount = location.state?.amount || "";
  const initialDescription = location.state?.description || "";
  const initialTransactionDate = location.state?.transactionDate || "";
  const fromWallet = !!location.state?.fromWallet;

  useEffect(() => {
    if (purchaseId) {
      fetchPurchase(purchaseId);
    }
  }, [purchaseId]);

  const fetchPurchase = async (id) => {
    try {
      const res = await creditPurchaseService.getCreditPurchaseById(id);
      if (res?.success) {
        setExistingPurchase(res.data?.creditPurchase || res.data);
      }
    } catch (err) {
      console.error("Failed to fetch credit purchase:", err);
    }
  };

  const handleSuccess = async () => {
    navigate("/accounting/expenses/credit-purchase");
  };

  return (
    <div className="container-fluid py-3 my-4">
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap">
        <div>
          <h4>{existingPurchase ? "Update GST Purchase" : "Create GST Purchase"}</h4>
          <BreadCrumb
            pathname="/accounting/expenses/credit-purchase/create"
            lastLabel={existingPurchase ? "Update GST Purchase" : "Create GST Purchase"}
            dynamicNames={{ expenses: "Expenses", "credit-purchase": "GST Purchase" }}
          />
        </div>
      </div>

      <CreditPurchaseForm
        initialBranchId={initialBranchId}
        initialAmount={initialAmount}
        initialDescription={initialDescription}
        initialTransactionDate={initialTransactionDate}
        existingPurchase={existingPurchase}
        fromWallet={fromWallet}
        onCancel={() => navigate("/accounting/expenses/credit-purchase")}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

export default CreditPurchaseCreate;
