import React from "react";

const StarRating = ({ value = 0, onChange, showValue = true }) => {
  const maxStars = 5;

  const handleClick = (index, isHalf = false) => {
    if (onChange) {
      const newValue = isHalf ? index + 0.5 : index + 1;
      onChange(newValue);
    }
  };

  return (
    <div className="star-rating d-flex align-items-center">
      {[...Array(maxStars)].map((_, i) => {
        const full = i + 1 <= Math.floor(value);
        const half = !full && i + 0.5 <= value;

        return (
          <span key={i} style={{ fontSize: "24px", cursor: "pointer" }}>
            {full ? (
              <span
                style={{ color: "#ffc107" }}
                onClick={() => handleClick(i)}
              >
                ★
              </span>
            ) : half ? (
              <span
                style={{
                  position: "relative",
                  display: "inline-block",
                  width: "24px",
                  height: "24px",
                }}
                onClick={() => handleClick(i, true)}
              >
                {/* gray background star */}
                <span style={{ color: "#e4e5e9", position: "absolute" }}>
                  ★
                </span>
                {/* yellow half overlay */}
                <span
                  style={{
                    color: "#ffc107",
                    position: "absolute",
                    width: "50%",
                    overflow: "hidden",
                  }}
                >
                  ★
                </span>
              </span>
            ) : (
              <span
                style={{ color: "#e4e5e9" }}
                onClick={() => handleClick(i)}
              >
                ★
              </span>
            )}
          </span>
        );
      })}
      {showValue && <span className="ms-2">({value})</span>}
    </div>
  );
};

export default StarRating;
