import React from "react";
import DisplayStatus from "../DisplayStatus/DisplayStatus";
import "./WorkPlan.css";

function WorkPlan({ tasksArray, numberOfDays }) {
  const headers = ['Tasks', 'Status', 'Est.', 'Changes'];
  return (
    <div className="work-plan">
      <h3>What is your {numberOfDays} Days Work Plan</h3>
      <table>
        <thead>
          <tr>
            {
              headers.map((header, index) => (
                <th key={`work_plan_header_${index}`}>{header}</th>
              ))
            }
          </tr>
        </thead>

        <tbody>
          {
            tasksArray.map((task, index) => {
              return (
                <tr key={`work_plan_${index}`}>
                  <td>{task.name}</td>
                  <td>
                    <DisplayStatus
                      completed={task.completed}
                      new_estimate={task.new_estimate}
                    />
                  </td>
                  <td>{task.time_estimate} h</td>
                  <td>{task.changes}</td>
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  );
}

export default  WorkPlan;
