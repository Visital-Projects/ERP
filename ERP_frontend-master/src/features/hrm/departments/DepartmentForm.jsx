import React, { useEffect, useState } from "react";
import branchService from "../../../services/branchService";

const DepartmentForm = ({ initialValues = {}, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    branch_id: initialValues.branch_id || "",
    name: initialValues.name || "",
  });
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const { data } = await branchService.getAll();
        setBranches(data?.data || data || []);
      } catch (e) {
        console.error("Failed to fetch branches", e);
      }
    };
    loadBranches();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.branch_id || !form.name.trim()) return;
    onSubmit(form);
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
          placeholder="Enter Department Name"
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
          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
        >
          {loading ? "Saving…" : initialValues?.id ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default DepartmentForm;

