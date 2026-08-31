import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import branchService from "../../../services/branchService";

const EditBranch = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await branchService.getOne(id);
        const branch = data?.data || data; // adjust to your API
        setName(branch?.name || "");
      } catch (e) {
        console.error("Failed to load branch", e);
        alert("Failed to load branch");
      } finally {
        setFetching(false);
      }
    };
    load();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    try {
      setLoading(true);
      await branchService.update(id, { name });
      alert("Branch updated successfully!");
      navigate("/branches");
    } catch (error) {
      console.error("Error updating branch", error);
      alert(error?.response?.data?.message || "Failed to update branch");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="p-6">Loading…</div>;

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Edit Branch</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium mb-1">Branch Name</label>
          <input
            type="text"
            name="name"
            placeholder="Enter Branch Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full border p-2 rounded"
          />
        </div>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={() => navigate("/branches")}
            className="px-3 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
          >
            {loading ? "Saving…" : "Update"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditBranch;
