import React, { Component } from "react";
import LeftMenu from "../../components/common/LeftMenu";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
import FormControl from "react-bootstrap/FormControl";
import Alert from "react-bootstrap/Alert";
import axios from "axios";
import routeNames from "../../constants/routeNames";
import "./setup.css";

import {
  userUpdateNameAndSetupIDAction,
  userLoggedOutAction
} from "../../reducers/userActions";

class DevSetupView extends Component {
  constructor(_props) {
    super(_props);

    this.state = {
      timezones: [],
      readonly: false,
      canOptOut: false,
    };

    this.selectTimezone = this.selectTimezone.bind(this);
    this.selectTime = this.selectTime.bind(this);
    this.nameChange = this.nameChange.bind(this);
    this.saveSetup = this.saveSetup.bind(this);
    this.optOutChanged = this.optOutChanged.bind(this);
    this.doOptOut = this.doOptOut.bind(this);
    this.viewDevGuideLine = this.viewDevGuideLine.bind(this);
  }

  componentDidMount() {
    /* CHECK ROLE */
    if (this.props.role_type_id !== 3) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }

    /* RETRIEVE TIMEZONES */
    var body = {
      action: "listTimezones"
    };

    var self = this;
    axios
      .post(routeNames.API_COMMON, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          self.setState({ timezones: data.result });
        }
      })
      .catch(function (_err) {
        if (_err && _err.response && _err.response.status === 401) {
          var action = userLoggedOutAction();
          self.props.dispatch(action);
          self.props.history.push(routeNames.LOGIN);
          return;
        }
      });

    if (this.props.full_name) {
      this.full_name = this.props.full_name;
    }

    /* RETRIEVE DATA */
    if (this.props.userId) {
      body = {
        action: "listSetup",
        userId: this.props.userId
      };

      axios
        .post(routeNames.API_DEV, body)
        .then(function (response) {
          var data = response.data;
          if (data.success) {
            var result = data.result[0];

            self.timeZoneName = result.timezone;
            self.time = result.hour.slice(0, 5); /* mysqlx: result.hour.slice(1, 6); */

            let alertMessage;
            let readonly = false;
            if (result.no_of_edits === 0) {
              alertMessage = "You are allowed to change your standup time just once.";
            } else if (result.no_of_edits >= 1) {
              alertMessage = "You have already set your standup time and will not be allowed to change it.";
              readonly = true;
            }
            self.setState({
              readonly,
              error: false,
              showAlert: true,
              alertMessage,
              canOptOut: true, // user can opt out only if standup has been set
            });

            /* FLAGS */
            self.timeZoneId = result.id;
            self.timeZoneError = false;
            self.timeZoneName = result.timezone;
            this.timeError = false;

          }
        })
        .catch(function (_err) { });
    }
  }

  selectTimezone(id, name) {
    this.timeZoneId = id;
    this.timeZoneError = false;
    this.timeZoneName = name;
    this.setState({});
  }

  selectTime(time) {
    this.time = time;
    this.timeError = false;
    this.setState({});
  }

  nameChange(e) {
    this.full_name = e.target.value;
    if (this.full_name.length > 0) this.fullNameError = false;
  }

  optOutChanged(e) {
    if (!this.optout) this.optout = true;
    else this.optout = !this.optout;
  }

  doOptOut() {
    if (!this.optout) {
      this.setState({
        errorOptOut: true,
        showAlertOptOut: true,
        alertMessageOptOut: "Please accept the Opt-out notice!"
      });
      return;
    }

    var body = {
      action: "optout",
      userId: this.props.userId
    };

    var self = this;
    axios
      .post(routeNames.API_DEV, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          var action = userLoggedOutAction();
          self.props.dispatch(action);
          self.props.history.push(routeNames.LOGIN);
        } else {
          self.setState({
            error: false,
            showAlertOptOut: true,
            alertMessage: "Bad request, please try again!"
          });
        }
      })
      .catch(function (_err) {
        if (_err && _err.response && _err.response.status === 401) {
          var action = userLoggedOutAction();
          self.props.dispatch(action);
          self.props.history.push(routeNames.LOGIN);
          return;
        }
      });
  }

  saveSetup() {
    const { readonly } = this.state;
    const canViewGuideLine = localStorage.getItem('canViewGuideLine');

    if (readonly) {
      this.setState({
        error: true,
        showAlert: true,
        alertMessage:
          "You have already set your standup time and will not be allowed to change it."
      });
      return;
    }

    if (!canViewGuideLine) {
      this.setState({
        error: true,
        showAlert: true,
        alertMessage:
          "Kindly read the developer guideline above to continue."
      });
      return;
    }

    if (!this.timeZoneId) this.timeZoneError = true;
    else this.timeZoneError = false;
    if (!this.time) this.timeError = true;
    else this.timeError = false;
    if (!this.full_name) this.fullNameError = true;
    else this.fullNameError = false;

    if (this.timeZoneError || this.timeError || this.fullNameError) {
      this.setState({});
      return;
    }

    /* SAVE */
    var body = {
      action: "setup",
      timeZone: this.timeZoneName,
      time: this.time,
      full_name: this.full_name,
      userId: this.props.userId
    };

    var self = this;
    axios
      .post(routeNames.API_DEV, body)
      .then(function (response) {
        var data = response.data;
        if (data.success) {
          /* SAVE NEW NAME */
          var action = userUpdateNameAndSetupIDAction(
            data.result[0].id,
            self.full_name
          );
          self.props.dispatch(action);

          const { no_of_edits } = data.result[0]

          let alertMessage = "Standup time was saved!";
          let readonly = false;
          if (no_of_edits === 0) {
            alertMessage += " You are allowed to change your standup time just once.";
          }  else if (no_of_edits >= 1) {
            alertMessage += " You have already set your standup time and will not be allowed to change it.";
            readonly = true;
          }

          self.setState({
            readonly,
            error: false,
            showAlert: true,
            alertMessage,
            canOptOut: true, // user can opt out only if standup has been set
          });

        } else {
          self.setState({
            error: true,
            showAlert: true,
            alertMessage: "Bad request! Please try again!"
          });
        }
      })
      .catch(function (_err) {
        self.setState({
          error: true,
          showAlert: true,
          alertMessage: "Bad request! Please try again!"
        });
      });
  }

  viewDevGuideLine() {
    localStorage.setItem('canViewGuideLine', true);
  }

  render() {
    var self = this;

    var timezonesDropdown = this.state.timezones.map(function (item) {
      return (
        <Dropdown.Item
          onClick={() => {
            self.selectTimezone(item.id, item.name);
          }}
          key={"timezone_" + item.id}
        >
          {item.abbreviation}
        </Dropdown.Item>
      );
    });

    var times = [];
    var zeroHour = new Date();
    zeroHour.setHours(0, 0, 0, 0);
    for (var i = 0; i < 48; i++) {
      times.push(
        ("0" + zeroHour.getHours()).slice(-2) +
        ":" +
        ("0" + zeroHour.getMinutes()).slice(-2)
      );
      zeroHour.setMinutes(zeroHour.getMinutes() + 30);
    }

    var timeDropdown = times.map(function (t, index) {
      return (
        <Dropdown.Item
          onClick={() => {
            self.selectTime(t);
          }}
          key={"time_" + index}
        >
          {t}
        </Dropdown.Item>
      );
    });

    var timezoneToDisplay;
    for (var i = 0; i < this.state.timezones.length; i++) {
      if (this.state.timezones[i].name === this.timeZoneName) {
        timezoneToDisplay = this.state.timezones[i].abbreviation;
        break;
      }
    }
    const performanceGuideLine = 'https://docs.google.com/document/d/126eTFwNJhvW52iDGIzWC4io4aSgMRMV4u0HCRJKos5s/edit#';

    return (
      <div className="container h-100">
        <div className="row h-100 w-100">
          <div className="col-sm-12 col-md-3">
            <LeftMenu />
          </div>
          <div className="col-sm-12 col-md-9 h-100 bg-white setupView">
            <div className="row header">
              <h2>
                Welcome{" "}
                {this.props.full_name ? this.props.full_name : "developer"}!
              </h2>
            </div>
            <div className="row subTitle">
              <h5>Select a time that works for you to do the daily standup.</h5>
              <br />
              <h5>
                Please choose it carefully because you will not be able to
                change the time once it's set.
              </h5>
            </div>
            <div className="row subTitle">
              <div
                className={
                  "col-3 rowTitle" + (this.timeZoneError ? " error" : "")
                }
              >
                <h5>Timezone</h5>
              </div>
              <div className="col">
                <DropdownButton
                  id="dropdownTimeZones"
                  title={
                    timezoneToDisplay ? timezoneToDisplay : "Select time zone"
                  }
                  variant="secondary"
                  bsPrefix="dropdownTimeZones"
                  disabled={this.state.readonly}
                >
                  {timezonesDropdown}
                </DropdownButton>
              </div>
            </div>
            <div className="row subTitle">
              <div
                className={"col-3 rowTitle" + (this.timeError ? " error" : "")}
              >
                <h5>Time</h5>
              </div>
              <div className="col-3">
                <DropdownButton
                  id="dropdownTimeZones"
                  title={this.time ? this.time : "Select time"}
                  variant="secondary"
                  bsPrefix="dropdownTimeZones"
                  defaultValue="00:00"
                  disabled={this.state.readonly}
                >
                  {timeDropdown}
                </DropdownButton>
              </div>
            </div>
            <div className="row subTitle">
              <div
                className={
                  "col-3 rowTitle" + (this.fullNameError ? " error" : "")
                }
              >
                <h5>Your full name</h5>
              </div>
              <div className="col">
                <FormControl
                  className="nameTextbox"
                  type="text"
                  placeholder="Full name"
                  onChange={this.nameChange}
                  defaultValue={this.props.full_name}
                  disabled={this.state.readonly}
                />
              </div>
            </div>
            <div className="row subTitle">
              <div className="col-3 rowTitle">
                <h5>Developer Guidelines</h5>
              </div>
              <div className="col">
                Please review the guidelines <a href={performanceGuideLine} onClick={this.viewDevGuideLine} rel="noopener noreferrer" target="_blank"><strong>here</strong></a>
              </div>
            </div>
            <div className="row subTitle">
              <div
                className="col-4 offset-3 btn btn--light btn--rounded btn--full"
                onClick={this.saveSetup}
              >
                Save
              </div>
              <div className="col-6 offset-3">
                <br />
                <Alert
                  variant={this.state.error ? "warning" : "success"}
                  show={this.state.showAlert ? true : false}
                  className="alertMessageSetup"
                >
                  <p>{this.state.alertMessage}</p>
                </Alert>
              </div>
            </div>
            <hr />
            <div className="row subTitle">
              <h2>Opt-out</h2>
            </div>
            <div className="row subTitle">
              <div className="col-1 my-auto">
                <FormControl
                  className="optoutCheckbox"
                  type="checkbox"
                  onChange={self.optOutChanged}
                  disabled={!this.state.canOptOut}
                />
              </div>
              <div
                className={
                  "col-10 my-auto" + (this.state.canOptOut ? "" : " disableText")
                }
              >
                By choosing the Opt-out option, I acknowledge that
                I will not be able to continue the daily standup and
                my performance evaluation score will be negatively affected.
              </div>
            </div>
            <div
              className="col-4 offset-3 btn btn--light btn--rounded btn--full subTitle"
              onClick={this.doOptOut}
            >
              Opt-Out
            </div>
            <div className="col-6 offset-3">
              <br />
              <Alert
                variant={this.state.errorOptOut ? "warning" : "success"}
                show={this.state.showAlertOptOut ? true : false}
                className="alertMessage"
              >
                <p>{this.state.alertMessageOptOut}</p>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  full_name: appState.userRoot.user.full_name,
  userId: appState.userRoot.user.id,
  role_type_id: appState.userRoot.user.role_type_id
});

export default withRouter(connect(mapStateToProps)(DevSetupView));
