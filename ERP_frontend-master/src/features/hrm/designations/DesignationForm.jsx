import React, { useEffect, useState } from "react";
import branchService from "../../../services/branchService";
import departmentService from "../../../services/departmentService";

const DesignationForm = ({ initialValues = {}, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    branch_id: initialValues.branch_id ?? "",
    department_id: initialValues.department_id ?? "",
    name: initialValues.name ?? "",
  });

  const [branches, setBranches] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await branchService.getAll();
        setBranches(data?.data || data || []);
      } catch (e) {
        console.error("Failed to fetch branches", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (!form.branch_id) {
      setDepartments([]);
      setForm((p) => ({ ...p, department_id: "" }));
      return;
    }
    (async () => {
      try {
        const { data } = await departmentService.getAll({ branch_id: form.branch_id });
        setDepartments(data?.data || data || []);
      } catch (e) {
        console.error("Failed to fetch departments", e);
      }
    })();
  }, [form.branch_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.branch_id || !form.department_id || !form.name.trim()) return;
    // onSubmit({
    //   branch_id: Number(form.branch_id),
    //   department_id: Number(form.department_id),
    //   name: form.name.trim(),
    // });
    // … inside handleSubmit of DesignationForm.jsx
    onSubmit({
        branch_id: Number(form.branch_id),
        department_id: Number(form.department_id),
        name: form.name.trim(),
    });
  
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Branch */}
      <div>
        <label className="block font-medium mb-1">
          Branch <span className="text-red-500">*</span>
        </label>
        <select
          name="branch_id"
          value={form.branch_id}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
        >
          <option value="">Select Branch</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Department */}
      <div>
        <label className="block font-medium mb-1">
          Department <span className="text-red-500">*</span>
        </label>
        <select
          name="department_id"
          value={form.department_id}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded"
          disabled={!form.branch_id}
        >
        <option value="">Select Department</option>
        {departments.map((d) => (
          <option key={d.id} value={d.id}>
            {d.name}
          </option>
        ))}
        </select>
      </div>

      {/* Name */}
      <div>
        <label className="block font-medium mb-1">
          Name <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          placeholder="Enter Designation Name"
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="px-3 py-2 border rounded">
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-60"
        >
          {loading ? "Saving…" : initialValues?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default DesignationForm;
