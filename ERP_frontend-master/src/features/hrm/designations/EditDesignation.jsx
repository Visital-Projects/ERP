

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import designationService from "../../../services/designationService";
import DesignationForm from "./DesignationForm";

const EditDesignation = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [designation, setDesignation] = useState(null);

  const getApiError = (err) => {
    const d = err?.response?.data;
    if (!d) return "Request failed";
    if (typeof d === "string") return d;
    if (d.message) return d.message;
    if (d.errors) return Object.values(d.errors).flat().join("\n");
    return JSON.stringify(d);
  };

  useEffect(() => {
    (async () => {
      try {
        const { data } = await designationService.getOne(id);
        setDesignation(data?.data || data);
      } catch (e) {
        console.error("Failed to load designation", e);
        alert(getApiError(e));
      } finally {
        setFetching(false);
      }
    })();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      await designationService.update(id, payload);
      alert("Designation updated successfully!");
      navigate("/designations");
    } catch (e) {
      console.error(e);
      alert(getApiError(e));
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Designation</h2>
      <DesignationForm
        initialValues={designation}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/designations")}
        loading={loading}
      />
    </div>
  );
};

export default EditDesignation;
