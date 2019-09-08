import React, { Component } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import CalendarTile from "../common/CalendarTile/CalendarTile";
import StatLegend from "../common/StatLegend/StatLegend";
import "./standupCalendar.css";
import nextIcon from "../../assets/right.svg";
import previousIcon from "../../assets/left.svg";
// import { formatDateWithoutYear } from "../../helpers";
import DisplayCalendarDate from '../common/DisplayCalendarDate/DisplayCalendarDate';

class StandupCalendar extends Component {
  constructor(_props) {
    super(_props);

    /* MONTHS TITLE */
    // var currentMonth = new Date(_props.date);
    // currentMonth.setHours(0, 0, 0, 0);
    // var currentMonthText = formatDateWithoutYear(currentMonth);

    // var prevMonth = new Date(currentMonth);
    // var nextMonth = new Date(currentMonth);

    // prevMonth.setMonth(prevMonth.getMonth() - 1);
    // var prevMonthText = formatDateWithoutYear(prevMonth);

    // nextMonth.setMonth(nextMonth.getMonth() + 1);
    // var nextMonthText = formatDateWithoutYear(nextMonth);

    this.state = {
      // currentMonthText: currentMonthText,
      // currentMonth: currentMonth,
      // prevMonthText: prevMonthText,
      // prevMonth: prevMonth,
      // nextMonthText: nextMonthText,
      // nextMonth: nextMonth,
      selectedIndex: 0,
      standupDate: this.props.calendarDays[0].standupDate,
      noMoreStandups: {
        active: false,
        prev: false
      }
    };

    // this.nextMonth = this.nextMonth.bind(this);
    // this.prevMonth = this.prevMonth.bind(this);
    this.nextDays = this.nextDays.bind(this);
    this.prevDays = this.prevDays.bind(this);
    this.changeToStandupDate = this.changeToStandupDate.bind(this);
    this.handleCalendarChange = this.handleCalendarChange.bind(this);
  }

  nextDays() {
    var newDate = new Date(
      new Date(this.props.date).setDate(
        new Date(this.props.date).getDate() + this.props.calendarMaxDays
      )
    );
    var nextDate = new Date(new Date(this.props.date)).getTime();
    var lastDate = new Date(this.props.standups[0].created_date).getTime();
    //add 10 days

    if (nextDate < lastDate) {
      this.props.calculateCalendarDates(newDate);
      this.setState({
        ...this.state,
        noMoreStandups: {
          active: false,
          prev: true
        }
      }, () => {
        this.changeToStandupDate(newDate, 0);
      });
    } else {
      this.setState({
        ...this.state,
        noMoreStandups: {
          active: true,
          prev: true
        }
      });
    }
  }

  prevDays() {
    var newDate = new Date(
      new Date(this.props.date).setDate(
        new Date(this.props.date).getDate() - this.props.calendarMaxDays
      )
    );
    var nextDate = new Date(newDate).getTime();
    var lastDate = new Date(
      this.props.standups[this.props.standups.length - 1].created_date
    ).getTime();
    if (nextDate >= lastDate) {
      this.props.calculateCalendarDates(newDate);
      this.setState(
        {
          ...this.state,
          noMoreStandups: {
            active: false,
            prev: false
          }
        },
        () => {
          this.changeToStandupDate(newDate, 0);
        }
      );
    } else {
      this.setState({
        ...this.state,
        noMoreStandups: {
          active: true,
          prev: false
        }
      });
    }
  }

  // nextMonth() {
  //   var newDate = new Date(
  //     new Date(this.props.date).setMonth(
  //       new Date(this.props.date).getMonth() + 1
  //     )
  //   );
  //   var month = new Date(newDate).getMonth();
  //   var startDate = new Date(newDate);
  //   for (let i = 0; i < this.props.standups.length; i++) {
  //     var tempMonth = new Date(this.props.standups[i].created_date).getMonth();
  //     if (month === tempMonth) {
  //       startDate = new Date(this.props.standups[i].created_date);
  //       break;
  //     }
  //   }

  //   var nextDate = new Date(startDate).getTime();
  //   var lastDate = new Date(this.props.standups[0].created_date).getTime();
  //   if (nextDate <= lastDate) {
  //     this.props.calculateCalendarDates(startDate);
  //     this.setState(
  //       {
  //         ...this.state,
  //         noMoreStandups: {
  //           active: false,
  //           prev: true
  //         }
  //       },
  //       () => {
  //         this.changeToStandupDate(startDate, 0);
  //       }
  //     );
  //   } else {
  //     this.setState({
  //       ...this.state,
  //       noMoreStandups: {
  //         active: true,
  //         prev: true
  //       }
  //     });
  //   }
  // }

  // prevMonth() {
  //   var newDate = new Date(
  //     new Date(this.props.date).setMonth(
  //       new Date(this.props.date).getMonth() - 1
  //     )
  //   );
  //   var month = new Date(newDate).getMonth();
  //   var startDate = new Date(newDate);
  //   for (let i = 0; i < this.props.standups.length; i++) {
  //     var tempMonth = new Date(this.props.standups[i].created_date).getMonth();
  //     if (month === tempMonth) {
  //       startDate = new Date(this.props.standups[i].created_date);
  //       break;
  //     }
  //   }

  //   var nextDate = new Date(startDate).getTime();
  //   var lastDate = new Date(
  //     this.props.standups[this.props.standups.length - 1].created_date
  //   ).getTime();
  //   if (nextDate >= lastDate) {
  //     this.props.calculateCalendarDates(startDate);

  //     this.setState(
  //       {
  //         ...this.state,
  //         noMoreStandups: {
  //           active: false,
  //           prev: false
  //         }
  //       },
  //       () => {
  //         this.changeToStandupDate(startDate, 0);
  //       }
  //     );
  //   } else {
  //     this.setState({
  //       ...this.state,
  //       noMoreStandups: {
  //         active: true,
  //         prev: false
  //       }
  //     });
  //   }
  // }

  changeToStandupDate(standupDate, index) {
    this.props.changeToStandupDate(standupDate);

    this.setState({
      ...this.state,
      selectedIndex: index,
      standupDate: standupDate
    });
  }

  handleCalendarChange(date) {
    const {
      calculateCalendarDates,
    } = this.props;

    this.changeToStandupDate(date, 0);
    calculateCalendarDates(date);

    this.setState({
      noMoreStandups: {
        active: false,
        prev: true,
      }
    });
  }

  render() {
    // var nextDaysArrowClass = "nextDays";
    // var prevDaysArrowClass = "prevDays";
    // if (this.props.page === 0) {
    //   /* FIRST RENDER -> DISABLE PREV */
    //   prevDaysArrowClass = "prevDays prevDaysDisable";
    // }
    // if (this.props.noMoreStandups) {
    //   /* END OF STANDUPS */
    //   nextDaysArrowClass = "nextDays nextDaysDisable";
    // }

    // const currentMonth = new Date(this.props.date);
    // currentMonth.setHours(0, 0, 0, 0);
    // const currentMonthText = formatDateWithoutYear(currentMonth);

    // const prevMonth = new Date(currentMonth);
    // const nextMonth = new Date(currentMonth);

    // prevMonth.setMonth(prevMonth.getMonth() - 1);
    // const prevMonthText = formatDateWithoutYear(prevMonth);

    // nextMonth.setMonth(nextMonth.getMonth() + 1);
    // const nextMonthText = formatDateWithoutYear(nextMonth);


    const { selectedIndex, standupDate } = this.state;
    const { calendarDays } = this.props;

    const calendarData = [
      {name: 'on time', bgColor: '#4CB050'},
      {name: 'early/late', bgColor: '#FFC933'},
      {name: 'missed', bgColor: '#FF6B5A'},
      {name: 'not applicable/weekend', bgColor: '#CCCCCC'},
    ];

    return (
      <div className="mb-5">
        {/* <div className="row justify-content-center monthHeader">
          <div className="col-3 text-right nextMonth" onClick={this.nextMonth}>
            {nextMonthText}
          </div>
          <div className="col-3 text-center currentMonth">
            {currentMonthText}
          </div>
          <div className="col-3 text-left prevMonth" onClick={this.prevMonth}>
            {prevMonthText}
          </div>
        </div>*/}

        <div className="d-flex justify-content-between mb-4">
          <div className="pointer">
            <DatePicker
              customInput={<DisplayCalendarDate date={standupDate}/>}
              onChange={this.handleCalendarChange}
              selected={standupDate}
            />
          </div>

          <div>
            <img 
              className="pointer rounded-circle border border-secondary mr-3"
              src={previousIcon}
              alt="previous icon"
              onClick={this.nextDays}
            />
            <img
              className="pointer rounded-circle border border-secondary"
              src={nextIcon}
              alt="next icon"
              onClick={this.prevDays}
            />
          </div>
        </div>

        <div className="d-flex mb-3 flex-wrap">
          {
            calendarDays.length && (
              calendarDays.map((dayData, index) => (
                <div key={`calender_tile_${index}`}>
                  <CalendarTile
                    data={dayData}
                    changeToStandupDate={this.changeToStandupDate}
                    active={selectedIndex === index}
                    index={index}
                  />
                </div>
              ))
            )
          }
        </div>

        <div className="d-flex flex-wrap">
          <StatLegend data={calendarData} />
        </div>

        {this.state.noMoreStandups.active && (
          <div
            className="mt-3 alert alert-warning text-center"
          >
            {
              this.state.noMoreStandups.prev
                ? "No more standups from this developer"
                : "This is the first week of standup for this developer"
            }
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(connect()(StandupCalendar));
