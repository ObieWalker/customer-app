import React, { Component } from "react";
import { withRouter } from "react-router";
import { connect } from "react-redux";
import axios from "axios";
import LeftMenu from "../../components/common/LeftMenu";
import routeNames from "../../constants/routeNames";
import { userLoggedOutAction } from "../../reducers/userActions";
import "./AccountSetting.css";

class AccountSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      success: null,
      mailList: ''
    };
    this.handleUserUpdate = this.handleUserUpdate.bind(this);
    this.mailListChanged = this.mailListChanged.bind(this);
  }

  componentDidMount() {
    if(this.props.role_type_id !== 2 && this.props.role_type_id !== 4 && this.props.role_type_id !== 3) {
      /* CLIENT CHECK */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }

    if(this.props.role_type_id === 4) {
      /* GET CURRENT MAILING LIST */
      var body = {
        action: "getMailingList",
        customerId: this.props.currentUser.id
      };

      var self = this;
      axios.post(routeNames.API_CUSTOMER, body)
        .then(function(response) {
          var data = response.data;
          if (data.success) {
            var mailList = '';
            data.result.map(function(mailData, index) {
              if(mailList === '') mailList += mailData.email;
              else mailList += "\r\n" + mailData.email;
            });
            self.setState({ mailList: mailList });
          }
        })
        .catch(function(_err) {
          if (_err && _err.response && _err.response.status === 401) {
            var action = userLoggedOutAction();
            self.props.dispatch(action);
            self.props.history.push(routeNames.LOGIN);
            return;
          }
        });
    }
  }

  handleUserUpdate = e => {
    e.preventDefault();

    /* CHECK THE EMAIL LIST FIRST */
    if(this.mailChanged && e.target.elements.mailList.value.length > 0) {
      var emails = e.target.elements.mailList.value.split("\n");
      for(var i = 0; i < emails.length; i++) {
        if(emails[i].length === 0) continue;

        if(/(.+)@(.+){2,}\.(.+){2,}/.test(emails[i]) === false) {
          this.setState({ error: "There is error in mailing list at line " + (i + 1) });
          return;
        }
      }

      emails = emails.join(',');
      /* UPDATE */
      var body = {
        action: "updateMailingList",
        customerId: this.props.currentUser.id,
        mailList: emails
      };

      var self = this;
      axios.post(routeNames.API_CUSTOMER, body)
        .then(function(response) {
          var data = response.data;

          if (data.success) {
            self.setState({
              error: null,
              success: "Update Success"
            });
          }
          else {
            self.setState({ error: "Update mailing list failed!"});
          }
        })
        .catch(function(_err) {
          if (_err && _err.response && _err.response.status === 401) {
            var action = userLoggedOutAction();
            self.props.dispatch(action);
            self.props.history.push(routeNames.LOGIN);
            return;
          }

          self.setState({ error: "Update mailing list failed!"});
        });
    }

    /* NOTHING CHANGE IN PASSWORD, RETURN */
    if(!e.target.elements.currentPassword.value && !e.target.elements.newPassword.value && !e.target.elements.retypedPassword.value) return;

    if (!e.target.elements.full_name.value) {
      this.setState({ error: "Please provide your valid name" });
    } else if (this.props.currentUser.login_type === "password" && !e.target.elements.currentPassword.value) {
      this.setState({ error: "Please provide your current password" });
    } else if (!e.target.elements.newPassword.value) {
      this.setState({ error: "Please provide your new password" });
    } else if (e.target.elements.newPassword.value.length < 6) {
      this.setState({ error: "Password must be minimum 6 characters long" });
    } else if (!e.target.elements.retypedPassword.value) {
      this.setState({ error: "Please retype your new password" });
    } else if (
      e.target.elements.newPassword.value !==
      e.target.elements.retypedPassword.value
    ) {
      this.setState({ error: "Password did not match!" });
    } else {
      let full_name = e.target.elements.full_name.value;
      let currentPassword = null;
      if (e.target.elements.currentPassword) {
        currentPassword = e.target.elements.currentPassword.value;
      }
      let newPassword = e.target.elements.newPassword.value;

      axios
        .post(routeNames.API_USER, {
          action: "user_update",
          userId: this.props.currentUser.id,
          login_type: this.props.currentUser.login_type,
          full_name,
          currentPassword,
          newPassword
        })
        .then(response => {
          if (response.data.success && response.data.result[0].result === 1) {
            this.setState({
              error: null,
              success: "Update Success"
            });

          } else if (response.data.success === false && response.data.status === 401) {
            let action = userLoggedOutAction();
            this.props.dispatch(action);
            this.props.history.push(routeNames.LOGIN);
          } else {
            this.setState({
              success: null,
              error: response.data.errorMessage
            });
          }
        })
        .catch(error => {
          this.setState({ error: "Bad Request", success: null })
        });
    }
  };

  mailListChanged(e) {
    this.setState({mailList:e.target.value});
    this.mailChanged = true;
    if(e.target.value.length === 0 && this.state.mailList.length === 0) this.mailChanged = false;
  }

  render() {

    return (
      <div className="container fillHeight">
        <div className="row w-100 fillHeight">
          <div className="col-sm-12 col-md-3  fillHeight">
            <LeftMenu />
          </div>
          <div className="col-sm-12 col-md-9 bg-white setupView fillHeight">
            <div className="row header">
              <h2>
                Welcome{" "}
                {this.props.currentUser.full_name
                  ? this.props.currentUser.full_name
                  : " Customer!"}
                !
              </h2>
            </div>
            <div className="row subTitle">
              <h3>You can update your account here</h3>
            </div>
            <div className="row">
              <div className="col-md-12 user-update-form">
                <form
                  id="login-form"
                  className="form"
                  onSubmit={this.handleUserUpdate}
                >
                  {this.state.error && (
                    <p className="alert alert-danger">{this.state.error}</p>
                  )}
                  {this.state.success && (
                    <p className="alert alert-success">
                      {this.state.success}
                    </p>
                  )}
                  <div className="form-group">
                    <label className="text-info">Name:</label>
                    <br />
                    <input
                      type="text"
                      name="full_name"
                      id="name"
                      defaultValue={this.props.currentUser.full_name}
                      className="form-control"
                    />
                  </div>
                  {this.props.currentUser.login_type === "password" && (
                    <div className="form-group">
                      <label className="text-info">Current Password:</label>
                      <br />
                      <input
                        type="password"
                        name="currentPassword"
                        id="password"
                        className="form-control"
                      />
                    </div>
                  )}
                  <div className="form-group">
                    <label className="text-info">New Password:</label>
                    <br />
                    <input
                      type="password"
                      name="newPassword"
                      id="newPassword"
                      className="form-control"
                    />
                  </div>

                  <div className="form-group">
                    <label className="text-info">Retype Password:</label>
                    <br />
                    <input
                      type="password"
                      name="retypedPassword"
                      id="retypedPassword"
                      className="form-control"
                    />
                  </div>
                  { this.props.role_type_id === 4 && (
                    <div>
                      <br/>
                      <div className="form-group">
                        <h3>Your mailing list (to receive developer activities notification)</h3>
                      </div>
                      <div className="form-group">
                        <h5>Separate emails by a new line</h5>
                      </div>
                      <div className="form-group">
                        <textarea
                          rows="5"
                          name="mailList"
                          id="mailList"
                          className="mailList"
                          value={this.state.mailList}
                          onChange={this.mailListChanged}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group">
                    <br />
                    <input
                      type="submit"
                      name="submit"
                      className="update-btn"
                      value="Update"
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  role_type_id: appState.userRoot.user.role_type_id,
  currentUser: appState.userRoot.user
});

export default withRouter(connect(mapStateToProps)(AccountSetting));
