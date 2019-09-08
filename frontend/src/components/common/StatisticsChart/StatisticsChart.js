import React from "react";
import StatLegend from "../StatLegend/StatLegend";
import "./StatisticsChart.css";

function StatisticsChart({ data }) {
  let dataLength = data.length;
  let computedWidth = 0;
  return (
    <div className="statistics-chart">
      <div className="statistics-bar">
        {
          data.map((stats, index) => {
            computedWidth += parseFloat(stats.percentage, 10);
            return (
              <div
                key={`division_${index}`}
                className="statistics-division"
                style={{
                  backgroundColor: `${stats.bgColor}`,
                  width: `${computedWidth}%`,
                  zIndex: `${dataLength - index}`
                }}
              ></div>
            )
          })
        }
      </div>

      <div className="statistics-legend d-flex flex-wrap">
        <StatLegend data={data} />
      </div>
    </div>
  );
}

export default StatisticsChart;
