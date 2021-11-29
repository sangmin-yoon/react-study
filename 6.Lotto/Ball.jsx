import React, { memo } from "react";

const Ball = memo(({ number, bonus }) => {
  let background;
  if (number <= 10) {
    background = "red";
  } else if (number <= 20) {
    background = "orange";
  } else if (number <= 30) {
    background = "yello";
  } else if (number <= 40) {
    background = "blue";
  } else {
    background = "greenn";
  }
  return (
    <div className="ball" style={{ background }}>
      {number}
      {bonus}
    </div>
  );
});

export default Ball;
