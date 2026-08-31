
// import React, { useState } from "react";
// import apiClient from "../../../services/apiClient";
// import { useNavigate } from "react-router-dom";

// const CreateBranch = () => {
//   const [name, setName] = useState("");
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!name.trim()) return;

//     try {
//       setLoading(true);
//       await apiClient.post("/branches", { name });
//       alert("Branch created successfully!");
//       navigate("/branches");
//     } catch (error) {
//       console.error("Error creating branch", error);
//       alert(error?.response?.data?.message || "Failed to create branch");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Create Branch</h2>

//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium mb-1">Branch Name</label>
//           <input
//           type="text"
//           name="name"
//           value={name}
//           onChange={(e) => setName(e.target.value)}
//           required
//           className="w-full border p-2 rounded"
//           placeholder="Enter Branch Name"
//           />
//         </div>

//         <div className="flex justify-end gap-2">
//           <button
//             type="button"
//             onClick={() => navigate("/branches")}
//             className="px-3 py-2 border rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-60"
//           >
//             {loading ? "Saving…" : "Create"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateBranch;




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import branchService from "../../../services/branchService";

const CreateBranch = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      setLoading(true);
      await branchService.create({ name });
      alert("Branch created successfully!");
      navigate("/branches"); // redirect to list
    } catch (error) {
      console.error("Error creating branch", error);
      alert(error?.response?.data?.message || "Failed to create branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Branch</h2>

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
            {loading ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateBranch;

