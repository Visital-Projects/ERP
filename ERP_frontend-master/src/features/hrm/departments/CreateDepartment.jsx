// // src/features/hrm/departments/CreateDepartment.jsx
// import React, { useState } from "react";
// import apiClient from "../../../services/apiClient";
// import { useNavigate } from "react-router-dom";

// const CreateDepartment = () => {
//   const [form, setForm] = useState({ name: "", branch_id: "" });
//   const [loading, setLoading] = useState(false);
//   const navigate = useNavigate();

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       setLoading(true);
//       await apiClient.post("/departments", form);
//       alert("Department created successfully!");
//       navigate("/departments");
//     } catch (error) {
//       console.error("Error creating department", error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
//       <h2 className="text-xl font-bold mb-4">Create Department</h2>
//       <form onSubmit={handleSubmit} className="space-y-4">
//         <div>
//           <label className="block font-medium mb-1">Department Name</label>
//           <input
//             type="text"
//             name="name"
//             value={form.name}
//             onChange={handleChange}
//             required
//             className="w-full border p-2 rounded"
//           />
//         </div>
//         <div>
//           <label className="block font-medium mb-1">Branch ID</label>
//           <input
//             type="text"
//             name="branch_id"
//             value={form.branch_id}
//             onChange={handleChange}
//             className="w-full border p-2 rounded"
//           />
//         </div>
//         <div className="flex justify-end gap-2">
//           <button
//             type="button"
//             onClick={() => navigate("/departments")}
//             className="px-3 py-2 border rounded"
//           >
//             Cancel
//           </button>
//           <button
//             type="submit"
//             disabled={loading}
//             className="px-3 py-2 bg-blue-600 text-white rounded"
//           >
//             {loading ? "Saving…" : "Create"}
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default CreateDepartment;




import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import departmentService from "../../../services/departmentService";
import DepartmentForm from "./DepartmentForm";

const CreateDepartment = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    try {
      setLoading(true);
      await departmentService.create(payload);
      alert("Department created successfully!");
      navigate("/departments");
    } catch (e) {
      console.error(e);
      alert(e?.response?.data?.message || "Failed to create department");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Create Department</h2>
      <DepartmentForm
        onSubmit={handleSubmit}
        onCancel={() => navigate("/departments")}
        loading={loading}
      />
    </div>
  );
};

export default CreateDepartment;
