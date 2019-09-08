import React, { Component } from 'react';
import Axios from 'axios';
import routeNames from '../constants/routeNames';
import '../css/LandingPage.css';

export default class EmailVerificationView extends Component {

  constructor(props){
    super(props);

    this.state = {
      isVerified: undefined
    }
  }

  componentWillMount() {
    const queryParamsString = this.props.location.search.substring(1), // remove the "?" at the start
    searchParams = new URLSearchParams( queryParamsString );
    let token = searchParams.get("token");
    let email = searchParams.get("email");
    Axios.post(routeNames.API_EMAIL_VERIFICATION, { email, token })
      .then((resp) => {
        if(resp.data.success === true){
          this.setState({ isVerified: true });
          setTimeout(() => { this.props.history.push('/') }, 4000)
        } else {
          this.setState({ isVerified: false });
        }
      }).catch((err) => {
        this.setState({ isVerified: false });
      })
  }

  render() {
    return (
      <div className='LandingPage verification-page container-fluid'>
        <nav className="row">
          <div className="col-md-1 col-md-offset-1">
            <img src="/img/logo.png" alt="turing" />
          </div>
          <div className="col-md-8 nav-title">
            Virtual Standup System
          </div>
        </nav>
        { this.state && this.state.isVerified && (
          <div className="col-sm-12 col-md-12 verification-page-view">
          <h1>Email verification success!</h1>
          <h3>You will be redirected to login page soon</h3>
        </div>
        )}
        { this.state && !this.state.isVerified && (
          <div className="col-sm-12 col-md-12 verification-page-view">
          <h1>Ops something went wrong!</h1>
          <h3>Please try again</h3>
        </div>
        )}
      </div>
    )

  }
}
