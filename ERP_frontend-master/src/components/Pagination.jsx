// src/components/PaginationDots.jsx
import React from "react";
import PropTypes from "prop-types";

const PaginationDots = ({ totalPages, currentPage, onPageChange }) => {
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push(2);

      if (currentPage > 3) pages.push("...");

      const start = Math.max(3, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== 2 && i !== totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="d-flex justify-content-end mt-3 flex-wrap">
      {getPages().map((page, idx) => (
        <button
          key={idx}
          className={`btn btn-sm mx-1 mb-1 ${
            page === currentPage ? "btn-primary" : "btn-outline-primary"
          }`}
          onClick={() => typeof page === "number" && onPageChange(page)}
          disabled={page === "..."}
        >
          {page}
        </button>
      ))}
    </div>
  );
};

PaginationDots.propTypes = {
  totalPages: PropTypes.number.isRequired,
  currentPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
};

export default PaginationDots;
