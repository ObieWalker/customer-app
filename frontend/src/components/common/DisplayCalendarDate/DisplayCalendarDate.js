import React from "react";
import calendarIcon from "../../../assets/calendar.svg";
import { formatDate } from "../../../helpers";

class DisplayCalendarDate extends React.Component {

  render () {
    const { onClick, date } = this.props;
    return (
      <div onClick={onClick}>
        <img src={calendarIcon} alt="calendar icon" />
        <span className="ml-3">{formatDate(date)}</span>
      </div>
    )
  }
}

export default  DisplayCalendarDate;
