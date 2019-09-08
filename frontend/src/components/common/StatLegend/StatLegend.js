import React from "react";
import { formatPercentage } from "../../../helpers";
import "./StatLegend.css";

function StatLegend({ data }) {
  return data.map((eachItem, index) => {
    const {
      bgColor, emoticon, name, percentage
    } = eachItem;
    const displayPercentage = formatPercentage(percentage);

    return (
      <div className="d-flex align-items-center mr-3 mb-1" key={`stat_legend_${index}`}>
        <div
          style={{backgroundColor: `${bgColor}`}}
          className="color-representation mr-1"
        ></div>

        <div className="text-capitalize legend-text">
          <span className="mr-1">
            {
              emoticon &&
              <img src={emoticon} alt="emoticon" className="emoticon"/>
            }
          </span>

          <span className="mr-1">
            {name}
          </span>

          <span className="mr-1">
            {displayPercentage && `(${displayPercentage})`}
          </span>
        </div>
      </div>
    );
  })
}

export default StatLegend;
