import React, { Component } from 'react';
import SignIn from '../components/auth/signIn';

import '../css/LandingPage.css';

export default class LoginView extends Component {

  render() {

    return (
      <div className='LandingPage row'>
        <div className="bg-dark col-sm-12 col-md-6">
          <header className="turing-header turing-header--layout-relative">
            <div className="turing-header__title">Turing</div>
          </header>
          <div className="LandingPage__promo-container">
            <h1 className="LandingPage__promo-title">
              Daily Standup
            </h1>
          </div>
        </div>
        <div className="col-sm-12 col-md-6">
          <div className="LandingPage__sign-in-container row justify-content-center">
            <div className="LandingPage__sign-in col col-xl-6">
              <SignIn />
            </div>
          </div>
        </div>
      </div>
    );
  }
}
