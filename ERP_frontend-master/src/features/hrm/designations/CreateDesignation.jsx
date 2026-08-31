import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import designationService from "../../../services/designationService";
import DesignationForm from "./DesignationForm";

function parseJwt(token) {
  try {
    const base64 = token.split(".")[1];
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

const CreateDesignation = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { user, token } = useSelector((s) => s.auth || {});

  const getApiError = (err) => {
    const d = err?.response?.data;
    if (!d) return "Request failed";
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.errors) return Object.values(d.errors).flat().join("\n");
    return JSON.stringify(d);
  };

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);

      const decoded = token ? parseJwt(token) : null;
      const created_by = user?.id ?? decoded?.id ?? decoded?.user_id;

      await designationService.create({
        ...payload, // { branch_id, department_id, name }
        created_by,
      });

      alert("Designation created successfully!");
      navigate("/designations");
    } catch (e) {
      console.error(e);
      alert(getApiError(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Designation</h2>
      <DesignationForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/designations")}
        loading={loading}
      />
    </div>
  );
};

export default CreateDesignation;
