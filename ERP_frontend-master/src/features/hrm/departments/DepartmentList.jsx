import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import departmentService from "../../../services/departmentService";

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const { data } = await departmentService.getAll();
      setDepartments(data?.data || data || []);
    } catch (e) {
      console.error("Failed to fetch departments", e);
      alert("Failed to fetch departments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;
    try {
      await departmentService.remove(id);
      setDepartments((prev) => prev.filter((d) => d.id !== id));
      alert("Deleted successfully");
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Departments</h2>
        <button
          onClick={() => navigate("/departments/create")}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          + Create Department
        </button>
      </div>

      {loading ? (
        <div>Loading…</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border text-left">#ID</th>
                <th className="p-2 border text-left">Branch</th>
                <th className="p-2 border text-left">Department</th>
                <th className="p-2 border text-left w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {departments.length ? (
                departments.map((d) => (
                  <tr key={d.id}>
                    <td className="p-2 border">{d.id}</td>
                    <td className="p-2 border">
                      {d.branch?.name ?? d.branch_id ?? "-"}
                    </td>
                    <td className="p-2 border">{d.name}</td>
                    <td className="p-2 border space-x-2">
                      <Link
                        to={`/departments/${d.id}/edit`}
                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(d.id)}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={4}>
                    No departments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DepartmentList;
