// import React, { useEffect, useState } from "react";
// import { Table, Button, Modal, Form } from "react-bootstrap";
// import {
//   fetchProductStock,
//   updateProductStock,
// } from "../../services/stockService";

// const Stock = () => {
//   const [stocks, setStocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [selectedProduct, setSelectedProduct] = useState(null);
//   const [quantity, setQuantity] = useState("");

//   // Fetch stocks on mount
//   const loadStocks = async () => {
//     try {
//       setLoading(true);
//       const data = await fetchProductStock();
//       setStocks(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     loadStocks();
//   }, []);

//   const handleEditClick = (product) => {
//     setSelectedProduct(product);
//     setQuantity("");
//     setShowModal(true);
//   };

//   const handleSave = async () => {
//     if (!quantity || isNaN(quantity)) {
//       alert("Please enter a valid quantity");
//       return;
//     }
//     try {
//       await updateProductStock(selectedProduct.id, parseFloat(quantity));
//       setShowModal(false);
//       loadStocks();
//     } catch (err) {
//       console.error(err);
//       alert("Failed to update stock");
//     }
//   };

//   return (
//     <div>
//       <h3>Product Stock</h3>
//       <Table striped bordered hover responsive>
//         <thead>
//           <tr>
//             <th>Name</th>
//             <th>SKU</th>
//             <th>Current Quantity</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {loading ? (
//             <tr>
//               <td colSpan="4" className="text-center">
//                 Loading...
//               </td>
//             </tr>
//           ) : stocks.length === 0 ? (
//             <tr>
//               <td colSpan="4" className="text-center">
//                 No products found
//               </td>
//             </tr>
//           ) : (
//             stocks.map((stock) => (
//               <tr key={stock.id}>
//                 <td>{stock.name}</td>
//                 <td>{stock.sku}</td>
//                 <td>{stock.quantity}</td>
//                 <td>
//                   <Button variant="info" onClick={() => handleEditClick(stock)}>
//                     +
//                   </Button>
//                 </td>
//               </tr>
//             ))
//           )}
//         </tbody>
//       </Table>

//       <Modal show={showModal} onHide={() => setShowModal(false)}>
//         <Modal.Header closeButton>
//           <Modal.Title>Update Quantity</Modal.Title>
//         </Modal.Header>
//         <Modal.Body>
//           {selectedProduct && (
//             <>
//               <p>
//                 <strong>Product:</strong> {selectedProduct.name}
//               </p>
//               <p>
//                 <strong>SKU:</strong> {selectedProduct.sku}
//               </p>
//               <Form.Group controlId="quantity">
//                 <Form.Label>Quantity <span className="text-danger">*</span></Form.Label>
//                 <Form.Control
//                   type="number"
//                   placeholder="Enter Quantity"
//                   value={quantity}
//                   onChange={(e) => setQuantity(e.target.value)}
//                 />
//               </Form.Group>
//             </>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <Button variant="secondary" onClick={() => setShowModal(false)}>
//             Cancel
//           </Button>
//           <Button variant="success" onClick={handleSave}>
//             Save
//           </Button>
//         </Modal.Footer>
//       </Modal>
//     </div>
//   );
// };

// export default Stock;

import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Spinner } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import BreadCrumb from "../../components/BreadCrumb";
import { useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  fetchProductStock,
  updateProductStock,
} from "../../services/stockService";

const Stock = () => {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState("");
  const [isClosingModal, setIsClosingModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [entriesPerPage, setEntriesPerPage] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch stocks on mount
  const loadStocks = async () => {
    try {
      setLoading(true);
      const data = await fetchProductStock();
      setStocks(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStocks();
  }, []);

  // ✅ Pagination + Search logic
  const filteredData = stocks.filter((stock) =>
    stock.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const indexOfLast = currentPage * entriesPerPage;
  const indexOfFirst = indexOfLast - entriesPerPage;
  const currentData = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / entriesPerPage);

  // ✅ Modal close animation
  const closeModal = () => {
    setIsClosingModal(true);
    setTimeout(() => {
      setShowModal(false);
      setIsClosingModal(false);
      setQuantity("");
      setSelectedProduct(null);
    }, 400); // duration must match CSS animation
  };

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setQuantity("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!quantity || isNaN(quantity)) {
      alert("Please enter a valid quantity");
      return;
    }
    try {
      await updateProductStock(selectedProduct.id, parseFloat(quantity));
      closeModal(); // <- use the animated close
      loadStocks();
    } catch (err) {
      console.error(err);
      alert("Failed to update stock");
    }
  };

  return (
    <div className="container mt-4">
      {/* ✅ Animation styles */}
      <style>{`
        @keyframes slideInUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideOutUp {
          from { transform: translateY(0); opacity: 1; }
          to { transform: translateY(-100%); opacity: 0; }
        }
        .custom-slide-modal.open .modal-dialog {
          animation: slideInUp 0.7s ease forwards;
        }
        .custom-slide-modal.closing .modal-dialog {
          animation: slideOutUp 0.7s ease forwards;
        }
        .entries-select:focus {
          border-color: #6FD943 !important;
          box-shadow: 0 0 0px 4px #70d94360 !important;
        }
      `}</style>

      {/* ✅ Header */}
      <div className="mb-4 mt-4">
        <h3>Product Stock</h3>
        <BreadCrumb pathname={location.pathname} onNavigate={navigate} />
      </div>

      {/* ✅ Table */}
      {/* ✅ Table Card */}
      <div className="card shadow-sm ">
        {/* ✅ Filters */}
        <div className="d-flex justify-content-between flex-wrap gap-2 ms-2 mt-3">
          <div className="d-flex align-items-center gap-2">
            <Form.Select
              value={entriesPerPage}
              onChange={(e) => setEntriesPerPage(parseInt(e.target.value))}
              style={{ width: "80px" }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </Form.Select>
          </div>

          <Form.Control
            className=" me-2 mb-auto"
            type="text"
            placeholder="Search..."
            style={{ maxWidth: "200px" }}
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <div className="card-body p-0">
          {/* ✅ Scrollable Table Section */}
          <div style={{ maxHeight: "400px", overflowY: "auto" }}>
            <Table
              striped
              bordered
              hover
              // responsive
              className="mb-0 text-center align-middle mt-3"
            >
              <thead className="table-light sticky-top">
                <tr>
                  <th>Name</th>
                  <th>SKU</th>
                  <th>Current Quantity</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      <Spinner animation="border" variant="success" />
                    </td>
                  </tr>
                ) : currentData.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      No products found
                    </td>
                  </tr>
                ) : (
                  currentData.map((stock) => (
                    <tr key={stock.id}>
                      <td>{stock.name}</td>
                      <td>{stock.sku}</td>
                      <td>{stock.quantity}</td>
                      <td>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Add Quantity</Tooltip>}
                        >
                          <Button
                            variant="success"
                            onClick={() => handleEditClick(stock)}
                          >
                            <i className="bi bi-plus-lg"></i>
                          </Button>
                        </OverlayTrigger>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </div>

        {/* ✅ Pagination (placed OUTSIDE scroll area) */}
        <div className="card-footer d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div className="small text-muted">
            Showing {indexOfFirst + 1} to{" "}
            {Math.min(indexOfLast, filteredData.length)} of{" "}
            {filteredData.length} entries
          </div>

          <nav>
            <ul className="pagination pagination-sm mb-0">
              <li
                className={`page-item ${currentPage === 1 ? "disabled" : ""}`}
              >
                <button
                  className="page-link"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                >
                  «
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
                      onClick={() => setCurrentPage(num)}
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
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                >
                  »
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* ✅ Modal */}
      <Modal
        show={showModal}
        onHide={closeModal}
        centered
        className={`custom-slide-modal ${isClosingModal ? "closing" : "open"}`}
        style={{ overflowY: "auto", scrollbarWidth: "none" }}
      >
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            handleSave();
          }}
        >
          <Modal.Header closeButton>
            <Modal.Title>Update Quantity</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedProduct && (
              <>
                <p>
                  <strong>Product:</strong> {selectedProduct.name}
                </p>
                <p>
                  <strong>SKU:</strong> {selectedProduct.sku}
                </p>
                <Form.Group controlId="quantity">
                  <Form.Label>
                    Quantity <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="Enter Quantity"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                    min="0"
                  />
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              Save
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default Stock;
