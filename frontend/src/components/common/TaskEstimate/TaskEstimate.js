import React from "react";
import { formatDateWithoutYear } from "../../../helpers";
import "./TaskEstimate.css";

function TaskEstimate({ tasks }) {
  tasks = tasks.filter(task => task.new_estimate !== null);
  const tableHeaders = ['Date', 'Task', 'Est.', 'New Est.', 'Changes'];

  if (!tasks.length) {
    return (
      <div>
        There are no task estimates to view at this moment
      </div>
    );
  }
  return (
    <table className="task-estimate">
      <thead>
        <tr>
          {
            tableHeaders.map((header, index) => (
              <th className="" key={`task_estimate_header_${index}`}>
                {header}
              </th>
            ))
          }
        </tr>
      </thead>

      <tbody>
        {
          tasks.map(task => (
            <tr key={task.id}>
              <td>{formatDateWithoutYear(task.updated_date)}</td>
              <td>{task.name}</td>
              <td>{task.time_estimate}h</td>
              <td>{task.new_estimate}h</td>
              <td>{task.changes}</td>
            </tr>
          ))
        }
      </tbody>
    </table>
  );
}

export default TaskEstimate;
