import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import departmentService from "../../../services/departmentService";
import DepartmentForm from "./DepartmentForm";

const EditDepartment = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [department, setDepartment] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await departmentService.getOne(id);
        setDepartment(data?.data || data);
      } catch (e) {
        console.error("Failed to load department", e);
        alert("Failed to load department");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      await departmentService.update(id, payload);
      alert("Department updated successfully!");
      navigate("/departments");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to update department");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Department</h2>
      <DepartmentForm
        initialValues={department}
        onSubmit={handleSubmit}
        onCancel={() => navigate("/departments")}
        loading={loading}
      />
    </div>
  );
};

export default EditDepartment;
