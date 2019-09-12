import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import axios from "axios";
import StatisticsChart from "../common/StatisticsChart/StatisticsChart";
import routeNames from "../../constants/routeNames";
import TaskEstimate from "../common/TaskEstimate/TaskEstimate";
import OkayEmoticon from "../../assets/okay_emoticon.svg";
import NotHappyEmoticon from "../../assets/not_happy_emoticon.svg";
import GreatEmoticon from "../../assets/great_emoticon.svg";
import GoodEmoticon from "../../assets/good_emoticon.svg";
import HelpOutline from "../../assets/help_outline.svg";
import {
  formatPercentage, percentageStatusClassName,
} from "../../helpers";
import "./devStats.css";

const MEAN_SCORE = 10;

class DevStatsView extends Component {
  constructor(_props) {
    super(_props);

    this.state = {
      totalDays: 0,
      ontimeDays: 0,
      earlyOrLateDays: 0,
      missedDays: 0,
      tasks: [],
      estimateScore: 0,
      consitencyScore: 0,
      firstDate: null,
      endAtOptoutDate: null,
      totalDaysForAttendanceRecord: 0,
      notHappyPercent: 0,
      okPercent: 0,
      goodPercent: 0,
      greatPercent: 100
    };

    this.getStandupByDate = this.getStandupByDate.bind(this);
    this.getStandupDateById = this.getStandupDateById.bind(this);
    this.calculateConsistencyScore = this.calculateConsistencyScore.bind(this);
  }

  componentDidMount() {
    /* CALCULATE FROM STANDUPS GIVEN BY PROPS */
    this.calculateStandupStats();
  }

  componentDidUpdate(prevProps) {
    if (this.props.tasks !== prevProps.tasks) {
      this.setState({ tasks: this.props.tasks }, () => this.calculateEstimateScore());
    }
    if (this.props.results !== prevProps.results) {
      this.handleStandupsByFeedback(this.props.results);
    }
  }

  /* THIS COMPONENT WILL:
  - CALCULATE DEV. STANDUP STATS BY PERCENT
  - CALCULATE DEV. TASK ESTIMATE SCORE
  - CALCULATE DEV. STANDUP CONSISTENCY/RELIABILITY
  */
  getAllTasks(startStandupId, endStandupId) {
    const body = {
      action: "getStandupTasksStatInRange",
      userId: this.props.devId,
      startStandupId,
      endStandupId,
    };
    this.props.onGetAllTasks(body);
  }

  calculateStandupStats() {
    const { standups } = this.props;
    /* 1. TOTAL DAYS = DIFFERENT BETWEEN THE FIRST AND THE LAST ONE
      BECAUSE WE ONLY CALCULATE FOR MAXIMUM 100 STANDUPS,
      SO WE CAN'T COUNT THE TOTAL DAYS FROM THE DAY THEY START STANDUP
    */
    /* CHANGES: 07th MAY:
      firstDate WILL BE THE SETUP DATE
      lastDate WILL BE THE optoutDate
      AND totalDays WILL BE CALCULATE FROM THESE TWO DATES,
      NOT BASE ON STANDUPS created_date
    */
    var firstDate = new Date(standups[0].startFromSetupDate);
    var countFirstDay = this.getStandupByDate(firstDate) === null ? false : true;
    if (!countFirstDay) firstDate = firstDate.setDate(firstDate.getDate() + 1); /* NOT COUNT FIRST DAY */

    var lastDate = new Date(standups[0].endAtOptoutDate);

    /* CHANGES: 19thMAY: DON'T COUNT WEEKEND AS MISSED */
    var totalDays = countFirstDay ? 1 : 0; /* FIRST DAY NOT COUNT, AND WE START FROM FIRST DAY + 1 */
    var from = new Date(standups[0].startFromSetupDate);
    var to = new Date(standups[0].endAtOptoutDate);
    from.setHours(0, 0, 0, 0);
    to.setHours(0, 0, 0, 0);
    while (from < to) {
      from.setDate(from.getDate() + 1);
      var day = from.getDay();
      if (day !== 0 && day !== 6) totalDays++;
      else {
        /* WE DON'T WANT TO COUNT WEEKEND, BUT THE DEV STILL STANDUP ON WEEKEND, SO WE HAVE TO CHECK HERE */
        var standupOnWeekend = this.getStandupByDate(from) === null ? false : true;
        if (standupOnWeekend) totalDays++;
      }
    }

    if (totalDays < standups.length) totalDays = standups.length; /* DEV CAN SETUP AN HOUR IN THE SAME DAY BUT NOT PASSED, THEN HE CAN STANDUP THE SAME DAY --> TOTAL STANDUPS WILL > TODALDAYS COUNTED */

    var ontimeDays = 0;
    var earlyOrLateDays = 0;

    for (var i = 0; i < standups.length; i++) {
      var standupData = standups[i];

      if (standupData) {
        var earlyOrLate = standupData.earlyOrLate;
        if (earlyOrLate) {
          earlyOrLate = earlyOrLate.replace(
            "-",
            ""
          ); /* WE DONT NEED TO KNOW EARLY OR LATE HERE */
          var [hours, minutes] = earlyOrLate.split(":");
          if (parseInt(hours) === 0 && parseInt(minutes) <= 5) ontimeDays++;
          else earlyOrLateDays++;
        } else {
          ontimeDays++; /* NULL = COUNT AS ON TIME */
        }
      }
    }

    var missedDays = totalDays - (earlyOrLateDays + ontimeDays);
    this.setState({
      totalDays: standups[0].totalDays,
      totalDaysForAttendanceRecord: totalDays,
      ontimeDays: ontimeDays,
      earlyOrLateDays: earlyOrLateDays,
      missedDays: missedDays,
      firstDate: firstDate,
      endAtOptoutDate: lastDate
    }, function () {
      /* CALCULATE CONSISTENCY SCORE */
      this.calculateConsistencyScore();
    });

    /* GET THE TASKS FROM THE FIRST STANDUP AND LAST STANDUP */
    var startStandupId = standups[standups.length - 1].standupId;
    var endStandupId = standups[0].standupId;

    /* GET ALL TASKS FOR CALCULATE TASK ESTIMATE SCORE */
    this.getAllTasks(startStandupId, endStandupId);
    /* GET FEEDBACK AND RATES */
    const standupIds = standups.map(standup => standup.standupId);
    this.getFeedbackByStandups(standupIds);
  }

  getFeedbackByStandups(standupIds) {

    const { role_type_id: roleId } = this.props;
    this.props.onGetFeedbackByStandups({
      action: 'get_feedback_rate',
      roleId,
      standupIds,
    })
  }

  handleStandupsByFeedback = (result) => {
    if(result && result.length > 0) {
      var totalRates = 0;
      result.map(function(rate) {
        totalRates += rate.numberOfRate;
      });

      var percentNotHappy = 0;
      var percentOK = 0;
      var percentGood = 0;
      var percentGreat = 0;

      if(totalRates > 0) {
        result.map(function(rate) {
          if(rate.rate === 0) percentNotHappy = Math.round(100 * rate.numberOfRate / totalRates);
          else if(rate.rate === 1) percentOK = Math.round(100 * rate.numberOfRate / totalRates);
          else if(rate.rate === 2) percentGood = Math.round(100 * rate.numberOfRate / totalRates);
          else percentGreat = Math.round(100 * rate.numberOfRate / totalRates);
        });

        this.setState( { notHappyPercent: percentNotHappy, okPercent: percentOK, goodPercent: percentGood, greatPercent: percentGreat } );
      }
    }
  }

  getStandupDateById(standupId) {
    for (var i = 0; i < this.props.standups.length; i++) {
      if (this.props.standups[i].standupId === standupId) {
        return this.props.standups[i].created_date;
      }
    }
  }

  getStandupByDate(date) {
    const { standups } = this.props;
    /* REMOVE THE TIME VALUES - WE ONLY COMPARE THE DATE */
    var date2TimeValue = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();
    for (var i = standups.length - 1; i >= 0; i--) {
      var standupDate = new Date(standups[i].created_date);
      var standupDate2TimeValue = new Date(
        standupDate.getFullYear(),
        standupDate.getMonth(),
        standupDate.getDate()
      ).getTime();
      if (standupDate2TimeValue === date2TimeValue) {
        return standups[i];
      }
    }

    return null;
  }

  calculateEstimateScore() {
    /* 2. CALCULATE ESTIMATION SCORE:
      - WE DIDN'T KNOW HOW MANY ACTUAL TIME THE DEV SPENT ON A TASK, SO, THERE WILL BE ASSUMPTIONS: - THE MORE COMPLETED TASK, THE MORE YOU SCORE, BUT NOT OVER 8H PER DAY
      - ONE DAY WILL HAVE 8 HOURS OF WORK
      - EACH COMPLETED TASK WILL BE COUNTED AS completedHours
      - unCompletedHours = 8 HOURS - completedHours.
      - IF completedHours > 8 HOURS, THEN THE delta WILL BE COUNTED AS estimatedMissed
      - IF THERE IS CHANGED IN new_estimate THE delta WILL BE COUNTED AS estimatedMissed
      - FOR A THREE DAYS RANGE: IF A TASK EXISTS FOR MORE THAN 3 DAYS WITHOUT COMPLETED THEN IT WILL BE COUNTED AS estimatedMissed EVEN THOUGH IT CAN BE COMPLETED LATER
      - THE SCORE = total EstimatedMissed / totalHours
    */

    if (this.state.tasks.length === 0) {
      return;
    }

    var totalCompletedHours = 0;
    var totalEstimateMissedHours = 0;

    var currentStandupId = this.state.tasks[0].standupId;
    var lastStandupdate = this.getStandupDateById(currentStandupId);
    var sameStandupCompletedHours = 0;
    var sameStandupUncompletedHours = 0;
    var sameStandupEstimateMissedHour = 0;
    var taskUncompletedIn3Days = [];

    var self = this;
    var how_many_tasks_changes_the_estimates = 0;
    this.state.tasks.map(function (task, index) {
      var standupId = task.standupId;
      var standupDate = self.getStandupDateById(standupId);

      if (task.new_estimate) {
        how_many_tasks_changes_the_estimates++;
      }
      if (currentStandupId !== standupId) {
        /* NEXT STANDUP */
        totalCompletedHours += sameStandupCompletedHours;

        sameStandupUncompletedHours = 8 - totalCompletedHours;
        if (sameStandupCompletedHours < 0) {
          sameStandupEstimateMissedHour += -sameStandupUncompletedHours;
        }

        currentStandupId = standupId;
        /* THREE DAYS PASSED? */
        var timepassed = new Date(standupDate) - new Date(lastStandupdate);
        var daypassed = Math.round(timepassed / (1000 * 60 * 60 * 24));
        if (daypassed > 3) {
          taskUncompletedIn3Days.map(function (task) {
            sameStandupEstimateMissedHour += task.new_estimate;
          });

          taskUncompletedIn3Days = [];
        }

        totalEstimateMissedHours += sameStandupEstimateMissedHour;

        sameStandupCompletedHours = 0;
        sameStandupEstimateMissedHour = 0;

        if (task.completed === 1) {
          sameStandupCompletedHours += task.time_estimate;
          var initialTask = task.initialTask;
          if (initialTask !== -1) {
            for (var i = taskUncompletedIn3Days.length - 1; i >= 0; i--) {
              if (taskUncompletedIn3Days[i].id === initialTask) {
                /* THAT LEFTOVER TASK WAS COMPLETED */
                taskUncompletedIn3Days.splice(i, 1);
              }
            }
          }
        } else {
          sameStandupEstimateMissedHour += Math.abs(
            task.new_estimate - task.time_estimate
          );
          taskUncompletedIn3Days.push(task);
        }
      } else {
        /* SAME STANDUP */
        if (task.completed === 1) {
          sameStandupCompletedHours += task.time_estimate;
          var initialTask = task.initialTask;
          if (initialTask !== -1) {
            for (var i = taskUncompletedIn3Days.length - 1; i >= 0; i--) {
              if (taskUncompletedIn3Days[i].id === initialTask) {
                /* THAT LEFTOVER TASK WAS COMPLETED */
                taskUncompletedIn3Days.splice(i, 1);
              }
            }
          }
        } else {
          sameStandupEstimateMissedHour += Math.abs(
            task.new_estimate - task.time_estimate
          );
          taskUncompletedIn3Days.push(task);
        }
      }
    });

    /* FINAL SCORE */
    var estimateScore = 0;
    if (totalEstimateMissedHours === 0 && totalCompletedHours === 0)
      estimateScore = 1;
    else
      estimateScore =
        1 - how_many_tasks_changes_the_estimates / this.state.tasks.length;

    this.setState({ estimateScore: estimateScore });
  }

  calculateConsistencyScore() {
    const { totalDays, firstDate } = this.state;
    /* CALCULATE DEV. STANDUP CONSISTENCY/RELIABILITY */
    /* ASSUMPTIONS: - NO DAY OFF - MEAN = PERFECT SCORE = 10
      /* HOW TO:
      1. SPLIT THE earlyOrLate TIME INTO RANGES AND GIVE SCORE FOR EACH RANGE
      2. CALCULATE CORRELLATION BETWEEN THESE SCORES BY DAYS
      3. CRONBACH ALPHA
    */

    if (totalDays <= 0 || !firstDate) return;
    /* 1.1: SETUP THE MEAN SCORE */
    var meanScore = [];
    for (var i = 0; i < totalDays; i++) meanScore.push(MEAN_SCORE);
    /* 1.2: CALCULATE DEVELOPER SCORE */
    var devScore = [];
    var standupDate = new Date(firstDate);

    for (i = 0; i < totalDays; i++) {
      if (i > 0) {
        standupDate.setDate(standupDate.getDate() + 1);
      }

      var standupData = this.getStandupByDate(standupDate);
      if (standupData) {
        if (standupData.earlyOrLate) {
          var [hours, minutes] = standupData.earlyOrLate
            .replace("-", "")
            .split(":"); /* WE COUNT EARLY = LATE FOR NOW */
          /* SCORING */
          /* ONTIME (+-5) = 10, EARLY/LATE (+-15) = 8, EARLY/LATE (+-30) = 5, OTHER: 3 */
          if (hours > 0) devScore.push(3);
          else {
            if (minutes <= 5) devScore.push(10);
            else if (minutes <= 15) devScore.push(8);
            else if (minutes <= 30) devScore.push(5);
            else devScore.push(3);
          }
        } else devScore.push(10); /* NULL = ON TIME */
      }
      else {
        /* CHANGES: 19th MAY: NOT COUNT WEEKEND AS MISSED */
        var day = standupDate.getDay();
        if (day !== 0 && day !== 6) devScore.push(0); /* NO STANDUP = 0 POINT. (ASSUMTION: NO DAY OFF) */
        else devScore.push(10); /* WEEKEND COUNT AS ON TIME */
      }
    }

    //devScore = [ 10, 10]; /*TEST */
    /* 2.1 AVERAGE SCORE */
    /* 2.2 VARIANCE */
    var devVariances = [];
    for (i = 0; i < totalDays; i++) {
      var vr = Math.pow(devScore[i] - MEAN_SCORE, 2);
      devVariances.push(vr);
    }

    /* 2.3 SUM OF INDIVIDUAL VARIANCE */
    var sumDevVariances = devVariances.reduce((a, b) => a + b, 0);

    /* 2.4 TOTAL VARIANCES */
    var totalVariances = 0;
    for (i = 0; i < totalDays; i++) {
      totalVariances += Math.pow(meanScore[i], 2);
    }

    /* 2.5 FINAL, COEFFICENT */
    var reliableCoeff = 1 - sumDevVariances / totalVariances;
    this.setState({ consitencyScore: reliableCoeff });
  }

  render() {
    const {
      missedDays, earlyOrLateDays, ontimeDays, totalDaysForAttendanceRecord,
      consitencyScore, tasks, estimateScore,
    } = this.state;

    const onTimePercentage = (ontimeDays/totalDaysForAttendanceRecord) * 100;
    const earlyLatePercentage = (earlyOrLateDays/totalDaysForAttendanceRecord) * 100;
    const missedPercentage = (missedDays/totalDaysForAttendanceRecord) * 100;

    const attendaceRecordData = [
      {name: 'on time', percentage: onTimePercentage, bgColor: '#4CB050'},
      {name: 'early/late', percentage: earlyLatePercentage, bgColor: '#FFC933'},
      {name: 'missed', percentage: missedPercentage, bgColor: '#FF6B5A'},
    ];
    const attendanceRecordPercentage = onTimePercentage + earlyLatePercentage;

    // <<<<<<<<< TODO: The percentages here is with using dummy data >>>>>>>>> //
    const customerSatisfactionData = [
      {name: 'great', percentage: this.state.greatPercent, bgColor: '#4CB050', emoticon: GreatEmoticon},
      {name: 'good', percentage: this.state.goodPercent, bgColor: '#8ACF30', emoticon: GoodEmoticon},
      {name: 'okay', percentage: this.state.okPercent, bgColor: '#FFC933', emoticon: OkayEmoticon},
      {name: 'not happy', percentage: this.state.notHappyPercent, bgColor: '#FF6B5A', emoticon: NotHappyEmoticon},
    ];

    return (
      <div className="">

        <div className="mb-5">
          <div
            aria-expanded="true"
            data-toggle="collapse"
            data-target="#collapse-attendance-record"
            aria-controls="collapse-attendance-record"
            className="d-flex mb-3 pointer accordion-toggle"
          >
            <h5 className="mr-auto">
              Attendance Record
            </h5>
            <div className={percentageStatusClassName(attendanceRecordPercentage)}>
              {formatPercentage(attendanceRecordPercentage)}
            </div>
          </div>
          <div className="collapse show" id="collapse-attendance-record">
            <StatisticsChart data={attendaceRecordData} />
          </div>
        </div>

        <div className="mb-5">
          <div
            aria-expanded="false"
            data-toggle="collapse"
            data-target="#collapse-time-estimate"
            aria-controls="collapse-time-estimate"
            className="d-flex mb-3 pointer accordion-toggle collapsed"
          >
            <h5 className="mr-auto">Task Estimate Accuracy</h5>
            <div className={percentageStatusClassName(estimateScore * 100)}>
              {formatPercentage(estimateScore * 100)}
            </div>
          </div>
          <div className="collapse" id="collapse-time-estimate">
          <TaskEstimate tasks={tasks} />
          </div>
        </div>

        <div className="mb-5">
          <div className="d-flex justify-content-between">
            <h5>
              Timeliness
              <span>
                <img src={HelpOutline} alt="help-icon" className="ml-2" />
              </span>
            </h5>
            <div className={percentageStatusClassName(consitencyScore * 100)}>
              {formatPercentage(consitencyScore * 100)}
            </div>
          </div> 
        </div>

        <div className="mb-5">
          <div
            aria-expanded="true"
            data-toggle="collapse"
            data-target="#collapse-customer-satisfaction"
            aria-controls="collapse-customer-satisfaction"
            className="d-flex pointer accordion-toggle"
          >
            <h5 className="mb-3">Customer Satisfaction</h5>
          </div>
          <div className="collapse show" id="collapse-customer-satisfaction">
            <StatisticsChart data={customerSatisfactionData} />
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id,
  tasks: appState.customer.tasks
});

const mapDispatchToPops = dispatch => {
  return {
    onGetAllTasks: (data) => dispatch({ type: "GET_ALL_TASKS", data }),
    onGetFeedbackByStandups: (data) => dispatch({ type: "GET_FEEDBACK_BY_STANDUPS", data })
  }
}
export default withRouter(connect(mapStateToProps, mapDispatchToPops)(DevStatsView));
