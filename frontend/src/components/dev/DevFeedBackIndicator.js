import React, { useState } from "react";

const DevFeedBackIndicator = props => {
  const [visible, setVisible] = useState(false);
  const toogleValue = () => {
    setVisible(!visible);
    if (props.onChange) props.onChange(!visible);
  };
  const style = {
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize : "27px",
    color: visible ? "green" : "#000"
  };
  return (
    <div style={style} onClick={toogleValue}>
      »
    </div>
  );
};

export default DevFeedBackIndicator;
