import React, { Component } from "react";
import "./CalendarTile.css";

class CalendarTile extends Component {
  constructor(props) {
    super(props);
    this.changeToStandupDate = this.changeToStandupDate.bind(this);
  }

  changeToStandupDate() {
    const {
      data, changeToStandupDate, index
    } = this.props;
    changeToStandupDate(data.standupDate, index);
  }

  getClassName() {
    const { data, active } = this.props;
    const { state } = data;
    let result = "";

    if (state === "ontime") {
      result += 'on-time-standup';
    } else if (state === "earlylate") {
      result += 'early-late-standup';
    } else if (state === "missed") {
      result += 'missed-standup';
    } else {
      result += 'other-options-standup';
    }

    if (active) result += " active";
    return result;
  }

  render() {
    const { data } = this.props;

    return (
      <div
        className={`tile ${this.getClassName()}`}
        onClick={this.changeToStandupDate}
      >
        <p className="center date-text">{data.day}</p>
      </div>
    );
  }
}

export default CalendarTile;
