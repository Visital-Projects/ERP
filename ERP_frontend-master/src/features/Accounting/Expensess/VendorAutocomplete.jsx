import React, { useState, useEffect, useRef } from "react";
import { Form } from "react-bootstrap";

/**
 * Search-as-you-type Autocomplete Input for Vendor Name
 * - Standard text input appearance (NO dropdown arrow, NO select control)
 * - Suggestions appear ONLY when the user types
 * - Clicking the input does NOT open a vendor list
 * - Closes on click outside or escape key
 * - Keyboard navigation (Up/Down/Enter) support
 */
const VendorAutocomplete = ({
  value = "",
  onChange,
  onSelectVendor,
  vendors = [],
  placeholder = "Search vendor...",
  disabled = false,
  isInvalid = false,
  error = null,
  name = "vendor_name",
  id = "vendor_name_autocomplete",
}) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef(null);

  // Sync internal state with external value changes (e.g. edit mode prefill)
  useEffect(() => {
    setInputValue(value || "");
  }, [value]);

  // Handle outside clicks to close the suggestion panel
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target)
      ) {
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  const getVendorName = (v) => {
    if (!v) return "";
    if (typeof v === "string") return v;
    return v.name || v.vendor_name || "";
  };

  // Filter vendors based on user typing
  const handleInputChange = (e) => {
    const query = e.target.value;
    setInputValue(query);
    onChange?.(query);

    const trimmed = query.trim().toLowerCase();
    if (trimmed.length > 0) {
      const filtered = vendors.filter((v) => {
        const vName = getVendorName(v).toLowerCase();
        return vName.includes(trimmed);
      });
      setSuggestions(filtered);
      setIsOpen(true);
      setHighlightedIndex(-1);
    } else {
      setSuggestions([]);
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  const handleSelectSuggestion = (vendor) => {
    const selectedName = getVendorName(vendor);
    setInputValue(selectedName);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange?.(selectedName);
    onSelectVendor?.(vendor);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[highlightedIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%" }}
      className="vendor-autocomplete-wrapper"
    >
      <Form.Control
        id={id}
        name={name}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
        isInvalid={isInvalid}
        autoComplete="off"
        style={{
          width: "100%",
          boxShadow: "none",
        }}
      />

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            zIndex: 1060,
            marginTop: "3px",
            backgroundColor: "#ffffff",
            border: "1px solid #ced4da",
            borderRadius: "0.375rem",
            boxShadow: "0 6px 16px rgba(0, 0, 0, 0.12)",
            maxHeight: "220px",
            overflowY: "auto",
          }}
        >
          {suggestions.length > 0 ? (
            suggestions.map((vendor, idx) => {
              const vendorName = getVendorName(vendor);
              const isHighlighted = idx === highlightedIndex;

              return (
                <div
                  key={vendor.id || `${vendorName}-${idx}`}
                  onClick={() => handleSelectSuggestion(vendor)}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  style={{
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "0.9rem",
                    color: "#212529",
                    backgroundColor: isHighlighted ? "#f1f5f9" : "transparent",
                    borderBottom:
                      idx === suggestions.length - 1
                        ? "none"
                        : "1px solid #f1f3f5",
                    transition: "background-color 0.15s ease",
                  }}
                >
                  {vendorName}
                </div>
              );
            })
          ) : (
            <div
              style={{
                padding: "8px 12px",
                fontSize: "0.85rem",
                color: "#6c757d",
                fontStyle: "italic",
              }}
            >
              No matching vendors found
            </div>
          )}
        </div>
      )}

      {error && <div className="invalid-feedback d-block">{error}</div>}
    </div>
  );
};

export default VendorAutocomplete;
