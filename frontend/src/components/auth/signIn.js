import React, { Component } from 'react';
import SocialConstant from '../../constants/SocialConstant';
import AuthForm from '../../components/common/AuthForm';
import FacebookLogo from '../../components/common/FacebookLogo';
import FacebookLogin from 'react-facebook-login/dist/facebook-login-render-props';
import GoogleLogin from 'react-google-login';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import axios from 'axios';
import roles from '../../constants/roles';
import routeNames from '../../constants/routeNames';
import Alert from 'react-bootstrap/Alert';
import '../../css/SignIn.css';

import {
  userLoggedInAction
} from '../../reducers/userActions';

class SignIn extends Component {

  constructor(_props) {
    super(_props);
    this.state = {
      signIn: true,
      error: false,
      showAlert: false,
      alertMessage: ''
    }

    this.handleSubmit = this.handleSubmit.bind(this);
    this.responseGoogle = this.responseGoogle.bind(this);
    this.responseFacebook = this.responseFacebook.bind(this);
    this.switchToSignIn = this.switchToSignIn.bind(this);
    this.switchToSignUp = this.switchToSignUp.bind(this);
  }

  handleSubmit(email, password, full_name) {
    
    if(email && email.length > 0 && /(.+)@(.+){2,}\.(.+){2,}/.test(email) === false) {
      self.setState( { error: true, showAlert: true, alertMessage: "Invalid email!" });
      return;
    }

    if(email && email.length > 0 && password && password.length > 0) {
      var action = 'login';
      if(!this.state.signIn) action = 'signup';
      var body = {
        action: action,
        email: email,
        password: password,
        full_name: full_name
      }

      var self = this;
      axios.post(routeNames.API_ACCOUNT, body)
      .then(function(response) {
        var data = response.data;

        if(data.success)
        {
          if(self.state.signIn) {
            var row = data.result[0];
            var login_type = "password";
            var action = userLoggedInAction(
              row.id,
              row.email,
              row.full_name,
              row.role_type_id,
              row.setupId,
              data.token,
              data.expires,
              login_type);
            self.props.dispatch(action);
            /* TO ROUTE */

            if(action.role_type_id === roles.DEVELOPER) {
              if(!action.setupId) self.props.history.push(routeNames.DEVELOPER_SETUP);
              else  self.props.history.push(routeNames.DEVELOPER_STANDUP);
            }
            if(action.role_type_id === roles.CUSTOMER) {
              self.props.history.push(routeNames.CUSTOMER_MATCHED_DEV);
            }
            if(action.role_type_id === roles.PM) {
              self.props.history.push(routeNames.PM);
            }
          }
          else {
            self.setState({signIn:true, error: false, showAlert: true, alertMessage:'Success! Please verify your email!'});
          }
        }
        else {
          self.setState( { error: true, showAlert: true, alertMessage: data.errorMessage });
        }
      })
      .catch(function(_err){
        self.setState( { error: true, showAlert: true, alertMessage: 'Unknown Error' });
      });
    }
    else {

    }
  }

  responseGoogle(response) {
    if (!response.hasOwnProperty('error')) {
      var gid = response.googleId;
      var email = response.profileObj.email;
      var full_name = response.profileObj.givenName + ' ' + response.profileObj.familyName;

      /* LOGIN */
      var action = 'loginGoogle';
      if(!this.state.signIn) action = 'signup_social';
      var body = {
        action: action,
        email: email,
        gid: gid,
        full_name: full_name
      }

      var self = this;
      axios.post(routeNames.API_ACCOUNT, body)

        .then(function (response) {
          var data = response.data;
          if (data.success) {
            if (self.state.signIn) {
              var row = data.result[0];
              var action = userLoggedInAction(
                row.id,
                row.email,
                row.full_name,
                row.role_type_id,
                row.setupId, data.token,
                data.expires
              );
              self.props.dispatch(action);
              /* TO ROUTE */

              if (action.role_type_id === roles.DEVELOPER) {
                if (!action.setupId) self.props.history.push(routeNames.DEVELOPER_SETUP);
                else self.props.history.push(routeNames.DEVELOPER_STANDUP);
              }
              if (action.role_type_id === roles.CUSTOMER) {
                self.props.history.push(routeNames.CUSTOMER_LIST_DEV);
              }
              if (action.role_type_id === roles.PM) {
                self.props.history.push(routeNames.PM);
              }
            }
            else {
              self.setState({ signIn: true, error: false, showAlert: true, alertMessage: 'Signup success, please login!' });
            }
          }
          else {
            self.setState({ error: true, showAlert: true, alertMessage: data.errorMessage });
          }

        })
        .catch(function (_err) {

        });
    }
  }


  responseFacebook(response) {
    if (response.hasOwnProperty('status') && response.status == undefined) return;
    var fid = response.id;
    var email = response.email;
    var full_name = response.name;

    /* LOGIN */
    var action = 'loginFacebook';
    if (!this.state.signIn) action = 'signup_social';
    var body = {
      action: action,
      email: email,
      fbid: fid,
      full_name: full_name
    }

    var self = this;
    axios.post(routeNames.API_ACCOUNT, body)
      .then(function (response) {
        var data = response.data;
        if(data.success)
        {
          if(self.state.signIn) {
            var row = data.result[0];
            var action = userLoggedInAction(
              row.id,
              row.email,
              row.full_name,
              row.role_type_id,
              row.setupId, data.token,
              data.expires
            );
            self.props.dispatch(action);
            /* TO ROUTE */

            if(action.role_type_id === roles.DEVELOPER) {
              if(!action.setupId) self.props.history.push(routeNames.DEVELOPER_SETUP);
              else  self.props.history.push(routeNames.DEVELOPER_STANDUP);
            }
            if(action.role_type_id === roles.CUSTOMER) {
              self.props.history.push(routeNames.CUSTOMER_LIST_DEV);
            }
            if(action.role_type_id === roles.PM) {
              self.props.history.push(routeNames.PM);
            }
          }
          else {
            self.setState({signIn:true, error: false, showAlert: true, alertMessage:'Signup success, please login!'});
          }
        }
        else {
          self.setState( { error: true, showAlert: true, alertMessage: data.errorMessage });
        }

      })
      .catch(function(_err){

      });
    }

  switchToSignIn() {
    this.setState({signIn:true});
  }

  switchToSignUp() {
    this.setState({signIn:false});
  }

  render() {

    return (
      <div className="SignInPage-portal col">
          <div className="SignInPage-form-container col">
            <div className="SignInPage-form-header">
              <div className="row  justify-content-center SignInPage-form-header__title">
                <div className={'col-5 text-nowrap text-right' + (this.state.signIn?'':' graySection')} onClick={this.switchToSignIn} >Sign In</div>
                <div className='col-2'>|</div>
                <div className={'col-5 text-nowrap text-left' + (this.state.signIn?' graySection':'')} onClick={this.switchToSignUp}>Sign Up</div>
              </div>
              {/*
              <div className="SignInPage-form-header__subtitle">
                For software engineers
              </div> */}
            </div>
            <AuthForm signIn={this.state.signIn} form="signInForm" onSubmit={this.handleSubmit} />
            <Alert variant={this.state.error ? 'warning' : 'success'} show={this.state.showAlert ? true : false} className='alertMessage'>
              <p>{this.state.alertMessage}</p>
            </Alert>
            <div className="SignInPage-or-divider">
              <div>
                OR
              </div>
            </div>
            <div>
              <div className="SignInPage-social-media__button">
                <GoogleLogin
                  clientId={SocialConstant.GOOGLE_APP_ID}
                  buttonText={(this.state.signIn ? 'Login with Google':'Sign Up with Google')}
                  onSuccess={this.responseGoogle}
                  onFailure={this.responseGoogle}
                  className="btn btn--light btn--rounded btn--full"
                >
                  <div>{(this.state.signIn ? 'Login with Google':'Sign Up with Google')}</div>
                </GoogleLogin>

                <FacebookLogin
                   appId={SocialConstant.FACEBOOK_APP_ID}
                   callback={this.responseFacebook}
                   fields="name,email"
                   render={renderProps => (
                     <div className="SignInPage-social-media__button">
                       <button className="btn btn--light btn--rounded btn--full facebookauth" onClick={renderProps.onClick}>
                         <FacebookLogo />
                         <span style={{
                           width: 150,
                           fontSize: 12,
                           marginLeft: 16
                         }}>
                           {(this.state.signIn ? 'Login with Facebook' : 'Sign Up with Facebook')}
                         </span>
                       </button>
                     </div>
                   )}
                 />
              </div>

            </div>
          </div>
        </div>
    );
  }
}

export default withRouter(connect()(SignIn));
