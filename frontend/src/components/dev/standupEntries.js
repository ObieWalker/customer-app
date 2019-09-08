import React, { Component, Fragment } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import { Link } from "react-router-dom";
import axios from "axios";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import Form from "react-bootstrap/Form";
import Alert from "react-bootstrap/Alert";
import WorkPlan from "../common/WorkPlan/WorkPlan";
import StandupQA from "../common/StandupQA/StandupQA";
import arrowBack from "../../assets/arrow_back.svg";
import routeNames from "../../constants/routeNames";
import DevStatsView from "../../components/customer/devStats";
import StandupCalendar from "../../components/customer/standupCalendar";
import { formatDate, isWeekend, compareDates } from "../../helpers";
import "./standupEntries.css";

import { userLoggedOutAction } from "../../reducers/userActions";

const CALENDAR_MAX_DAYS_TO_DISPLAY = 10;

class StandupEntries extends Component {
  constructor(_props) {
    super(_props);

    this.state = {
      answers: [],
      tasks: [],
      standups: [],
      selectedStandupIndex: 0,
      error: false,
      showAlert: false,
      alertMessage: "",
      feedbacks: [],
      full_name: "...",
      optout: 0,
      calendarDisplayLastIndex: 0,
      noMoreStandups: false,
      calendarCurrentPage: 0,
      noStandupAtThisDate: false,
      optoutId: -1 /* WHEN CUSTOMER FIRST VIEW DEV, LIST THE LATEST STANDUP PERIOD */,
      standupPeriods: [],
      devStatsKey: 1,
      isWeekend: false,
      standupApplicable: false,
    };

    this.getStandups = this.getStandups.bind(this);
    this.getUserInfo = this.getUserInfo.bind(this);
    this.changeDate = this.changeDate.bind(this);

    if (this.props.usefor === "customer") {
      this.customerFeedbackChange = this.customerFeedbackChange.bind(this);
      this.saveFeedback = this.saveFeedback.bind(this);
      this.getStandupByDate = this.getStandupByDate.bind(this);
      this.calculateCalendarDates = this.calculateCalendarDates.bind(this);
      this.getStandupIndexByDate = this.getStandupIndexByDate.bind(this);
      this.changeToStandupDate = this.changeToStandupDate.bind(this);
      this.selectPeriod = this.selectPeriod.bind(this);
      this.generateShareableLink = this.generateShareableLink.bind(this);
    }
  }

  componentDidMount() {
    const { role_type_id, usefor, dispatch, history } = this.props;
    /* CHECK ROLE */
    if (
      (role_type_id !== 3 && usefor === "dev") ||
      (role_type_id !== 4 && role_type_id !== 2 && usefor === "customer")
    ) {
      /* COME FROM A SHAREABLE LINK? */
      const url = new URL(window.location.href);
      const sharecode = url.searchParams.get('sharecode');
      if (!sharecode) {
        /* LOG OUT AND FORCE TO LOGIN PAGE */
        var action = userLoggedOutAction();
        dispatch(action);
        history.push(routeNames.LOGIN);
        return;
      }
      /* CLIENT SIDE ALLOW TO GO THROUGH, WILL CHECK HASHCODE IN SERVER SIDE */
    }

    this.getStandups();
    if (usefor === "customer") {
      this.getUserInfo();
      this.getStandupPeriods();
    }
  }

  getUserInfo() {
    var body = {
      action: "getUserInfo",
      userId: this.props.devId
    };

    return axios
      .post(routeNames.API_USER, body)
      .then(response => {
        const { data } = response;

        if (data.success) {
          if (data.result.length > 0) {
            this.setState({
              ...this.state,
              full_name: data.result[0].full_name,
              optout: data.result[0].optout
            });
          } else {
            this.setState({
              ...this.state,
              full_name: "Developer"
            });
          }
        }
      })
      .catch(() => {
        this.setState({ ...this.state, full_name: "Developer" });
      });
  }

  getStandupPeriods() {
    var body = {
      action: "getDevStandupPeriods",
      devId: this.props.devId
    };

    axios
      .post(routeNames.API_CUSTOMER, body)
      .then(response => {
        const { data } = response;

        if (data.success) {
          data.result.unshift({
            id: this.state.optoutId,
            devId: this.props.devId
          });
          this.setState({
            ...this.state,
            standupPeriods: data.result
          });
        } else {
          data.result = [];
          data.result.push({
            id: this.state.optoutId,
            devId: this.props.devId
          });
          this.setState({
            ...this.state,
            standupPeriods: data.result
          });
        }
      })
      .catch(error => {
        if (error && error.response && error.response.status === 401) {
          var action = userLoggedOutAction();
          this.props.dispatch(action);
          this.props.history.push(routeNames.LOGIN);
          return;
        }
      });
  }

  getStandups() {
    const { usefor, devId } = this.props;
    const { optoutId } = this.state;

    let apiRoute = routeNames.API_DEV;
    let body = {
      action: "getStandups",
      userId: this.props.userId /* FOR DEV: CURRENT userId = devId */
    };

    if (usefor === "customer") {
      body = {
        devId,
        optoutId,
        action: "getStandupsByOptOutPeriod",
      };
      apiRoute = routeNames.API_CUSTOMER;
    }

    axios
      .post(apiRoute, body)
      .then(response => {
        const { data } = response;
        if (data.success) {
          if (data.result.length > 0) {
            /* LOAD CURRENT STANDUPS */
            var standupId = data.result[0].standupId;
            this.getStandupAnswers(standupId);
            this.getStandupPlanTasks(standupId);
            this.getStandupFeedback(standupId);
            /* UDATE STATE */
            this.setState({
              ...this.state,
              standups: data.result,
              devStatsKey: this.state.devStatsKey + 1
            }, () => {
              if (this.props.usefor === "customer") {
                var latestDate = new Date(
                  this.state.standups[
                    this.state.calendarDisplayLastIndex
                  ].created_date
                );
                this.calculateCalendarDates(latestDate);
              }
            });
          }
        }
      })
      .catch((error) => {
        if (error && error.response && error.response.status === 401) {
          var action = userLoggedOutAction();
          this.props.dispatch(action);
          this.props.history.push(routeNames.LOGIN);
          return;
        }
      });
  }

  /* THIS ONE SHOULD CHANGE TO GET TASKS BY standupId */
  getStandupAnswers(standupId) {
    var body = {
      action: "getStandupAnswers",
      standupId: standupId,
      devId: this.props.devId /* FOR SHAREABLE LINK AUTHORIZATION */
    };
    var self = this;
    axios
      .post(routeNames.API_DEV, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          self.setState({ ...self.state, answers: data.result });
        }
      })
      .catch(function (_err) { });
  }

  /* THIS ONE SHOULD CHANGE TO GET TASKS BY standupId */
  getStandupPlanTasks(standupId) {
    var body = {
      action: "getStandupPlanTasks_byId",
      standupId: standupId,
      devId: this.props.devId /* FOR SHAREABLE LINK AUTHORIZATION */
    };

    var self = this;
    axios
      .post(routeNames.API_DEV, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          self.setState({ ...self.state, tasks: data.result });
        }
      })
      .catch(function (_err) { });
  }

  getStandupFeedback(standupId) {
    var body = {
      action: "getFeedbackByStandup",
      standupId: standupId
    };
    var apiRoute = routeNames.API_DEV;

    if (this.props.usefor === "customer") {
      body = {
        action: "get_feedback",
        customerId: this.props.userId,
        standupId: standupId,
        devId: this.props.devId /* FOR SHAREABLE LINK AUTHORIZATION */
      };
      apiRoute = routeNames.API_CUSTOMER;
    }

    var self = this;
    axios
      .post(apiRoute, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          self.setState({ feedbacks: data.result });
        } else self.setState({ ...self.state, feedbacks: [] });
      })
      .catch(function (_err) {
        self.setState({ ...self.state, feedbacks: [] });
      });
  }

  changeDate(index) {
    if (index === this.state.selectedStandupIndex) return;
    var standupId = this.state.standups[index].standupId;
    this.getStandupAnswers(standupId);
    this.getStandupPlanTasks(standupId);
    this.getStandupFeedback(standupId);
    this.setState({
      ...this.state,
      selectedStandupIndex: index,
      noStandupAtThisDate: false
    });
  }

  getStandupByDate(date) {
    /* REMOVE THE TIME VALUES - WE ONLY COMPARE THE DATE */
    var date2TimeValue = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
    ).getTime();

    for (var i = 0; i < this.state.standups.length; i++) {
      var standupDate = new Date(this.state.standups[i].created_date);
      var standupDate2TimeValue = new Date(
        standupDate.getFullYear(),
        standupDate.getMonth(),
        standupDate.getDate()
      ).getTime();
      if (standupDate2TimeValue === date2TimeValue) {
        return this.state.standups[i];
      }
    }

    return null;
  }

  getStandupIndexByDate(date) {
    /* REMOVE THE TIME VALUES - WE ONLY COMPARE THE DATE */
    var date2TimeValue = new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate()
      // date
    ).getTime();

    for (var i = 0; i < this.state.standups.length; i++) {
      var standupDate = new Date(this.state.standups[i].created_date);
      var standupDate2TimeValue = new Date(
        standupDate.getFullYear(),
        standupDate.getMonth(),
        standupDate.getDate()
      ).getTime();
      if (standupDate2TimeValue === date2TimeValue) {
        return i;
      }
    }

    return -1;
  }

  standupApplicable(date) {
    const { standups } = this.state;
    // find the first standup created before the passed date parameter
    const theStandup = standups.find(standup => date >= new Date(standup.created_date));

    if (!theStandup) return false;

    const setupDate = theStandup.startFromSetupDate;
    const endDate = theStandup.endAtOptoutDate;

    return (
      compareDates(date, setupDate, '>=') &&
      compareDates(date, endDate, '<=')
    );
  }

  calculateCalendarDates(date) {
    /* CALCULATE THE CALENDAR DATES */
    var latestDate = new Date(date);
    var tempDate = new Date(date);

    var days = [];
    for (
      var i = this.state.calendarDisplayLastIndex;
      i < CALENDAR_MAX_DAYS_TO_DISPLAY;
      i++
    ) {
      var standupData = this.getStandupByDate(tempDate);
      if (!standupData) {
        if (isWeekend(tempDate) || !this.standupApplicable(tempDate)) {
          days.push({
            state: "not-applicable/weekend",
            day: tempDate.getDate(),
            standupDate: tempDate
          });
        } else {
          days.push({
            state: "missed",
            day: tempDate.getDate(),
            standupDate: tempDate
          });
        }
      } else {
        var onTime = false;
        var earlyOrLate = standupData.earlyOrLate;
        if (earlyOrLate) {
          earlyOrLate = earlyOrLate.replace(
            "-",
            ""
          ); /* WE DONT NEED TO KNOW EARLY OR LATE HERE */
          var [hours, minutes] = earlyOrLate.split(":");
          if (parseInt(hours) === 0 && parseInt(minutes) <= 5) onTime = true;
          else onTime = false;
        } else {
          onTime = true; /* NULL = COUNT AS ON TIME */
        }

        if (onTime) {
          days.push({
            state: "ontime",
            day: tempDate.getDate(),
            standupDate: tempDate
          });
        } else {
          days.push({
            state: "earlylate",
            day: tempDate.getDate(),
            standupDate: tempDate
          });
        }
      }

      /* CHECK NEXT DATE */
      var newTempDate = new Date(tempDate);
      tempDate = newTempDate;
      tempDate.setDate(tempDate.getDate() - 1);
    }
    var calendarDisplayLastIndex = this.state.calendarDisplayLastIndex++; //+ CALENDAR_MAX_DAYS_TO_DISPLAY;
    var noMoreStandups = false;
    if (calendarDisplayLastIndex >= this.state.standups.length)
      noMoreStandups = true;

    /* AND SET */
    this.setState({
      calendarDate: latestDate,
      calendarDays: days,
      noMoreStandups: noMoreStandups,
      calendarDisplayLastIndex: calendarDisplayLastIndex,
      calendarCurrentPage:
        calendarDisplayLastIndex / CALENDAR_MAX_DAYS_TO_DISPLAY - 1
    });
  }

  /* FOR CUSTOMER ONLY */
  customerFeedbackChange(e) {
    this.customerFeedback = e.target.value;
    this.setState({ ...this.state, feedbacks: [this.customerFeedback] });
  }

  saveFeedback() {
    var standupId = this.state.standups[this.state.selectedStandupIndex]
      .standupId;
    var body = {
      action: "feedback",
      customerId: this.props.userId,
      standupId: standupId,
      feedback: this.state.feedbacks[0]
        .replace(/,/g, "&#44;")
        .replace(/[^\x20-\x7E]/g, "")
    };

    var self = this;
    axios
      .post(routeNames.API_CUSTOMER, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          self.setState({
            ...self.state,
            error: false,
            showAlert: true,
            alertMessage: "Your feedback was sent. Thank you!"
          });
        }
      })
      .catch(function (_err) {
        self.setState({
          ...this.state,
          error: false,
          showAlert: true,
          alertMessage: "Error sending feedback, please try again."
        });
      });
  }

  changeToStandupDate(date) {
    var index = this.getStandupIndexByDate(date);
    if (index !== -1) {
      this.changeDate(index);
    } else {
      /* NO STANDUPS AT THIS DATE */
      this.setState({
        ...this.state,
        selectedStandupIndex: -1,
        noStandupAtThisDate: true,
        isWeekend: isWeekend(date),
        standupApplicable: this.standupApplicable(date),
      });
    }
  }

  selectPeriod(event) {
    const optoutId = Number(event.target.id);
    if (optoutId === this.state.optoutId) return;

    this.setState({
      ...this.state, optoutId
    }, () =>  this.getStandups());
  }

  generateShareableLink() {
    /* SERVER */
    var body = {
      action: "addShareableLink",
      devId: this.props.devId
    };

    var self = this;
    axios
      .post(routeNames.API_CUSTOMER, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          var token = data.token;
          var link = window.location.href + '?sharecode=' + token;
          /*COPY TO CLIPBOARD */
          var body = document.getElementsByTagName('body')[0];
          var tempInput = document.createElement('input');
          body.appendChild(tempInput);
          tempInput.setAttribute('value', link);
          tempInput.select();
          document.execCommand('copy');
          body.removeChild(tempInput);

          self.setState({ shareLinkCopied: true, shareLinkError: false });
        }
        else self.setState({ shareLinkCopied: true, shareLinkError: true });
        setTimeout(() => { self.setState({ shareLinkCopied: false }); }, 3000);
      })
      .catch(function (_err) {
        self.setState({ shareLinkCopied: true, shareLinkError: true });
        setTimeout(() => { self.setState({ shareLinkCopied: false }); }, 3000);
      });
  }

  render() {
    const { role_type_id, usefor, devId } = this.props;
    const {
      shareLinkError, shareLinkCopied, optout, optoutId, standups,
      standupApplicable, calendarDate, calendarDays, noMoreStandups,
      calendarCurrentPage, standupPeriods, noStandupAtThisDate,
      isWeekend, selectedStandupIndex, tasks, answers, feedbacks,
      alertMessage,
    } = this.state;

    let fullName = "";
    if (usefor === "customer") {
      fullName = this.state.full_name;
    } else if (usefor === "dev") {
      fullName = this.props.full_name;
    }

    const standupDates = standups.map((standup, index) => {
      if (index > 8) return "";
      const selected = selectedStandupIndex === index ? "selected" : "";
      return (
        <div
          className={`standupDate ${selected}`}
          key={"std_" + standup.standupId}
          onClick={() => this.changeDate(index)}
        >
          {("0" + new Date(standup.created_date).getDate()).slice(-2) +
            "/" +
            ("0" + (new Date(standup.created_date).getMonth() + 1)).slice(-2)}
        </div>
      );
    });

    /* ANSWERS FOR THREE QUESTIONS */
    let yesterdayWork = "";
    if (answers[0]) yesterdayWork = answers[0].answer;
    let todayWork = "";
    if (answers[1]) todayWork = answers[1].answer;
    let issues = "";
    if (answers[2]) issues = answers[2].answer;

    /* FEEDBACKS */
    let displayFeedback = "";
    if (usefor === "dev") {
      displayFeedback = feedbacks.map((feedbackData, index) => {
        let roleType = "";
        if (feedbackData.role_type_id === 4) {
          roleType = "Customer";
        } else if (feedbackData.role_type_id === 2) {
          roleType = "Turing PM"
        }

        return (
          <div className="row feedback" key={"fb_" + index}>
            <div className="col-4">
              <b>
                {feedbackData.full_name} ({roleType})
              </b>
            </div>
            <div className="col-8">
              <p>{feedbackData.feedback.replace(/&#44;/g, ",")}</p>
            </div>
          </div>
        );
      });
    } else if (usefor === "customer") {
      var feedbackValue = feedbacks.length > 0 ? feedbacks[0].feedback : "";
      if (feedbackValue) feedbackValue = feedbackValue.replace(/&#44;/g, ",");
      displayFeedback = (
        <div className="mb-4">
          <Form.Control
            as="textarea"
            rows="4"
            placeholder="Your note here..."
            onChange={this.customerFeedbackChange}
            value={feedbackValue}
            disabled={!(role_type_id === 2 || role_type_id === 4)}
          />
        </div>
      );
    }

    let dropdownPeriodsTitle = "";
    if(standups && standups.length > 0) {
      if (optoutId === -1 && standups.length > 0) {
        const firstDate = new Date(standups[0].startFromSetupDate);
        const endAtOptoutDate = new Date(standups[0].endAtOptoutDate);

        const firstDateText = formatDate(firstDate);
        const lastDateText = formatDate(endAtOptoutDate);
        const range = `${firstDateText} - ${lastDateText}`;

        if (optout === 0) {
          dropdownPeriodsTitle = "Latest (" + range + ")";
        } else {
          dropdownPeriodsTitle = "Latest (Opt-outed)(" + range + ")";
        }
      } else {
        for (let i = 0; i < standupPeriods.length; i++) {
          const period = standupPeriods[i];
          if (period.id === optoutId) {
            const setupDateText = formatDate(new Date(period.setupDate));
            const optoutDateText = formatDate(new Date(period.optoutDate));
            dropdownPeriodsTitle = `${period.id}. ${setupDateText} . ${optoutDateText}`;
          }
        }
      }
    }    

    var periodsDropdown = standupPeriods.map((period, index) => {
      let title;
      if (period.id === -1) {
        title = dropdownPeriodsTitle;
      } else {
        const setupDate = new Date(period.setupDate);
        const setupDateText = formatDate(setupDate);
        const optoutDate = new Date(period.optoutDate);
        const optoutDateText = formatDate(optoutDate);
        title = `${period.id}. ${setupDateText} / ${optoutDateText}`;
      }

      return (
        <Dropdown.Item
          key={`standup_period_dropdown_${index}`}
          onClick={this.selectPeriod}
          id={period.id}
        >
          {title}
        </Dropdown.Item>
      );
    });

    const devStatusClassName = optout ? 'inactive' : 'active';
    const { CUSTOMER_LIST_DEV, DEVELOPER_STANDUP } = routeNames;

    return (
      <Fragment>
        <div className="my-5">
          <h3>Turing</h3>

          <div className="d-flex my-4 justify-content-between">
            <Link to={usefor === "customer" ? CUSTOMER_LIST_DEV : DEVELOPER_STANDUP}>
              <img
                alt="go back"
                src={arrowBack}
                className="pointer"
              />
            </Link>

            {
              (role_type_id === 2 || role_type_id === 4) ? (
                <div className='shareable-link' onClick={this.generateShareableLink}>
                  <Alert
                    variant={shareLinkError ? 'warning' : 'success'}
                    show={shareLinkCopied ? true : false}
                    className='alertMessageStandupEntries'
                  >
                    {shareLinkError ? 'Unknown Error!' : 'Shareable link copied!'}
                  </Alert>
                </div>
              ) : ""
            }

          </div>

          <h2>Daily Standup</h2>

          <div className="d-flex">
            <h4>{fullName}</h4>
            <div className={`dev-status mt-2 ml-2 ${devStatusClassName}`}
            ></div>
          </div>
        </div>

        {
          usefor === "customer" && (
            <div className="section">
              <h3 className="section-title">Standup Period</h3>
              <DropdownButton
                id="dropdown-standup-periods"
                title={dropdownPeriodsTitle}
              >
                {periodsDropdown}
              </DropdownButton>
            </div>
          )
        }
        {
          usefor === "customer" && (
            <div className="section">
              <h3 className="section-title mb-5">Stats</h3>
              {
                standups.length ? (
                  <DevStatsView
                    devId={devId}
                    standups={standups}
                  />
                ) : <h6>No standup available at this time.</h6>
              }
            </div>
          )
        }


        {
          standups.length &&
          <Fragment>
            <div className="section">
              <h3 className="section-title mb-5">Standup Entries</h3>
              {
                usefor === "customer" && calendarDate &&
                (
                  <StandupCalendar
                    date={calendarDate}
                    standups={standups}
                    calendarDays={calendarDays}
                    page={calendarCurrentPage}
                    prevMonth={this.prevMonth}
                    nextMonth={this.nextMonth}
                    getStandups={this.getStandups}
                    standupPeriods={standupPeriods}
                    noMoreStandups={noMoreStandups}
                    calendarMaxDays={CALENDAR_MAX_DAYS_TO_DISPLAY}
                    changeToStandupDate={this.changeToStandupDate}
                    calculateCalendarDates={this.calculateCalendarDates}
                  />
                )
              }

              {
                usefor === "dev" && (
                  <div className="d-flex mb-4">{standupDates}</div>
                )
              }
              {
                noStandupAtThisDate && !isWeekend && standupApplicable && (
                  <div className="text-center">
                    <h2>The developer missed the standup for this date!</h2>
                  </div>
                )
              }
              {
                noStandupAtThisDate && !isWeekend && !standupApplicable && (
                  <div className="text-center">
                    <h2>Standup not applicable for this date</h2>
                  </div>
                )
              }
              {
                noStandupAtThisDate && isWeekend && (
                  <div className="text-center">
                    <h2>Weekend!</h2>
                  </div>
                )
              }

              {!noStandupAtThisDate && (
                <div>
                  <div>
                    <StandupQA
                      question="What did you work on yesterday?"
                      answer={yesterdayWork.replace(/&#44;/g, ",")}
                    />

                    <StandupQA
                      question="What will you be working on today?"
                      answer={todayWork.replace(/&#44;/g, ",")}
                    />

                    <StandupQA
                      question="Any questions or blockers?"
                      answer={issues.replace(/&#44;/g, ",")}
                    />
                  </div>

                  <div>
                    <WorkPlan
                      tasksArray={tasks}
                      numberOfDays={3}
                    />
                  </div>
                </div>
              )}
            </div>

            {!noStandupAtThisDate && (
              <div className="section">
                {
                  usefor === "dev" && (
                    <h3 className="section-title mb-5">
                      Note from TPM/Customer
                    </h3>
                  )
                }
                {
                  usefor === "customer" && (
                    <h3 className="section-title mb-5">
                      Note to developer
                    </h3>
                  )
                }

                {displayFeedback}

                <Alert
                  variant={this.state.error ? "warning" : "success"}
                  show={this.state.showAlert ? true : false}
                  className="alertMessage"
                >
                  <p>{alertMessage}</p>
                </Alert>

                {
                  usefor === "customer" && (role_type_id === 2 || role_type_id === 4) && (
                    <div
                      className="btn btn--dark px-4"
                      onClick={this.saveFeedback}
                    >
                      Send
                      </div>
                  )
                }
              </div>
            )
            }
          </Fragment>
        }

        <div className={"container-fluid" + (standups.length > 0 ? " hidden" : "")}>
          {
            usefor === "dev" && (
              <div className="row subTitle nostandups">
                <h2>You don’t have any standups recorded!</h2>
              </div>
            )
          }

          {
            usefor === "customer" && (
              <div className="row subTitle nostandups">
                <h2>The developer didn't have any standups recorded!</h2>
              </div>
            )
          }
        </div>
      </Fragment>
    );
  }
}

const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id
});

export default withRouter(connect(mapStateToProps)(StandupEntries));
