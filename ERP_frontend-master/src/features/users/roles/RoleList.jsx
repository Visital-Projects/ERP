import React, { useEffect, useState } from "react";
import { fetchRoles, deleteRole } from "../../../services/roleService";
import RoleFormModal from "./RoleFormModal";
import "./RoleList.css";
import { OverlayTrigger, Tooltip, Button, Spinner } from "react-bootstrap";
import BreadCrumb from "../../../components/BreadCrumb";
import { useNavigate, useLocation } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { toast } from "react-toastify";

const RoleList = () => {
  const [allRoles, setAllRoles] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem("user"))
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [entriesPerPage, setEntriesPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const loadRoles = async () => {
    try {
      const data = await fetchRoles();
      let filteredRoles = data;

      if (user?.type === "super admin") {
        filteredRoles = data.filter(
          (r) => r.name.toLowerCase() !== "super admin"
        );
      } else if (user?.type === "company") {
        filteredRoles = data.filter(
          (r) =>
            r.name.toLowerCase() !== "super admin" &&
            r.name.toLowerCase() !== "company"
        );
      }

      setAllRoles(filteredRoles);
      setRoles(filteredRoles);
    } catch (err) {
      console.error("Failed to load roles:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setUser(JSON.parse(localStorage.getItem("user")));
  }, []);

  useEffect(() => {
    if (user) {
      loadRoles();
    }
  }, [user]);

  const handleEdit = (role) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  // ✅ Updated Delete Confirmation (with animation + design)
  const handleDelete = async (id) => {
    confirmAlert({
      customUI: ({ onClose }) => (
        <div
          className="custom-confirm-modal bg-white p-4 rounded shadow text-center"
          style={{
            width: "400px",
            borderRadius: "12px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            animation: "fadeIn 0.3s ease-in-out",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              color: "#ff0055",
              marginBottom: "10px",
            }}
          >
            ❗
          </div>
          <h4 className="fw-bold mb-2">Are you sure?</h4>
          <p className="text-muted mb-4">
            This action cannot be undone. Do you want to continue?
          </p>
          <div className="d-flex justify-content-center gap-3">
            <Button
              variant="danger"
              className="px-4"
              style={{
                backgroundColor: "#ff4d79",
                border: "none",
                fontWeight: "600",
              }}
              onClick={onClose}
            >
              No
            </Button>
            <Button
              variant="success"
              className="px-4"
              style={{
                backgroundColor: "#6FD943",
                border: "none",
                fontWeight: "600",
              }}
              onClick={async () => {
                try {
                  await deleteRole(id);
                  loadRoles();
                  toast.success("Role deleted successfully!", { icon: false });
                } catch (err) {
                  console.error("Failed to delete role:", err);
                  toast.error("Failed to delete role.", { icon: false });
                } finally {
                  onClose();
                }
              }}
            >
              Yes
            </Button>
          </div>
        </div>
      ),
    });
  };

  const filteredRoles = roles
    .filter((role) => {
      const roleMatch = role.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const permissionMatch = (role.permissions || []).some((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      return roleMatch || permissionMatch;
    })
    .sort((a, b) => a.name.localeCompare(b.name));

  const totalPages = Math.ceil(filteredRoles.length / entriesPerPage);

  const displayedRoles = filteredRoles.slice(
    (currentPage - 1) * entriesPerPage,
    currentPage * entriesPerPage
  );

  const handleEntriesPerPageChange = (e) => {
    setEntriesPerPage(parseInt(e.target.value));
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  return (
    <div className="role-list-container">
      <style>{`
        @keyframes fadeIn {
          from {opacity: 0; transform: scale(0.9);}
          to {opacity: 1; transform: scale(1);}
        }
      `}</style>

      <div className="role-list-header">
        <div>
          <h2>Manage Roles</h2>
          <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
        </div>

        <OverlayTrigger placement="top" overlay={<Tooltip>Add Role</Tooltip>}>
          <Button
            onClick={() => {
              setSelectedRole(null);
              setIsModalOpen(true);
            }}
            className="btn-success btn-sm d-flex align-items-center justify-content-center"
            style={{ width: "60px", height: "45px", padding: 0 }}
          >
            <i className="bi bi-plus-lg"></i>
          </Button>
        </OverlayTrigger>
      </div>

      {/* Controls */}
      <div className="pagination-controls d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-3">
          <select
            value={entriesPerPage}
            onChange={handleEntriesPerPageChange}
            className="form-select form-select-sm"
            style={{ width: "80px", height: "40px" }}
          >
            {[10, 25, 50, 100].map((num) => (
              <option key={num} value={num}>
                {num}
              </option>
            ))}
          </select>
        </div>

        <input
          type="text"
          placeholder="Search..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="m-0"
          style={{ width: "250px" }}
        />
      </div>

      {/* Table */}
      <div className="role-table-card p-4 mb-4">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
          </div>
        ) : (
          <table className="role-table table-striped">
            <thead>
              <tr>
                <th>Role</th>
                <th>Permissions</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayedRoles.map((role) => (
                <tr key={role.id}>
                  <td className="px-3 text-center">{role.name}</td>
                  <td>
                    <div>
                      {(role.permissions || []).map((p) => (
                        <span key={p.id} className="rounded p-2 m-1 px-3 badge">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Edit</Tooltip>}
                    >
                      <button
                        className="btn btn-sm btn-info me-1"
                        onClick={() => handleEdit(role)}
                      >
                        <i className="bi bi-pencil-fill text-white"></i>
                      </button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={<Tooltip>Delete</Tooltip>}
                    >
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(role.id)}
                      >
                        <i className="bi bi-trash-fill text-white"></i>
                      </button>
                    </OverlayTrigger>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Footer */}
        <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap">
          <div className="small text-muted">
            Showing {(currentPage - 1) * entriesPerPage + 1} to{" "}
            {Math.min(currentPage * entriesPerPage, filteredRoles.length)} of{" "}
            {allRoles.length} entries
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage - 1)}
                >
                  &laquo;
                </button>
              </li>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (num) => (
                  <li
                    key={num}
                    className={`page-item ${
                      currentPage === num ? "active" : ""
                    }`}
                  >
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(num)}
                    >
                      {num}
                    </button>
                  </li>
                )
              )}
              <li
                className={`page-item ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
              >
                <button
                  className="page-link"
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  &raquo;
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadRoles}
        role={selectedRole}
      />
    </div>
  );
};

export default RoleList;
