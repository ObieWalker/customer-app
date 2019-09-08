import React from "react";
import "./DisplayStatus.css";

function DisplayStatus({ completed, new_estimate }) {
  let text, className;
  if (completed) {
    text = "Done";
    className = "done";
  } else if (new_estimate) {
    text = "Doing";
    className = "doing";
  } else {
    text = "To do";
    className = "todo";
  }

  return (
    <div className={`work-plan-status ${className}`}>
      {text}
    </div>
  );
}

export default DisplayStatus;
