import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import branchService from "../../../services/branchService";

const BranchList = () => {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const { data } = await branchService.getAll();
      // adjust if your API wraps list in data.data, etc.
      setBranches(data?.data || data || []);
    } catch (e) {
      console.error("Failed to fetch branches", e);
      alert("Failed to fetch branches");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure? This action cannot be undone.")) return;

    try {
      await branchService.remove(id);
      setBranches((prev) => prev.filter((b) => b.id !== id));
      alert("Deleted successfully");
    } catch (e) {
      console.error("Delete failed", e);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold">Sites</h2>
        <button
          onClick={() => navigate("/branches/create")}
          className="px-3 py-2 bg-blue-600 text-white rounded"
        >
          + Create Branch
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
                <th className="p-2 border text-left">Name</th>
                <th className="p-2 border text-left w-40">Actions</th>
              </tr>
            </thead>
            <tbody>
              {branches.length ? (
                branches.map((b) => (
                  <tr key={b.id}>
                    <td className="p-2 border">{b.id}</td>
                    <td className="p-2 border">{b.name}</td>
                    <td className="p-2 border space-x-2">
                      <Link
                        to={`/branches/${b.id}/edit`}
                        className="px-2 py-1 text-sm bg-blue-500 text-white rounded"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(b.id)}
                        className="px-2 py-1 text-sm bg-red-500 text-white rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="p-4 text-center text-gray-500" colSpan={3}>
                    No branches found.
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

export default BranchList;

