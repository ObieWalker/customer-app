import React, { Component } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import routeNames from '../../constants/routeNames';

import {
  userLoggedOutAction
} from '../../reducers/userActions';

class DevFAQView extends Component {

  componentDidMount() {

    /* CHECK ROLE */
    if (this.props.role_type_id !== 3) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }
  }

  render() {

    return (
      <div className='container h-100'>
        <div className='row h-100 w-100'>
          <div className='col-sm-12 col-md-3 h-100'>
            <LeftMenu />
          </div>
          <div className='col-sm-12 col-md-9  h-100 bg-white setupView'>
            <div className='row header'><h2>FAQ</h2></div>
            <div className='row subTitle'><h3>1.Purpose</h3></div>
            <div className='row subTitle'><h5>The Virtual Standup System is built to test the responsiveness and consistency of the developer. Through the daily standup and tasks estimates, we can track stats and evaluate our candidates.</h5></div>
            <div className='row subTitle'><h3>2.Setup daily standup time</h3></div>
            <div className='row subTitle'><h5>You are required to choose the time that you will be doing your daily standup</h5><h5>Please choose it carefully as you will not be able to change the time once it's set.</h5></div>
            <div className='row subTitle'><h3>3.The standup time window</h3></div>
            <div className='row subTitle'><h5>You can complete your daily standup as early as one hour before or as late as one hour after your daily standup time</h5></div>
            <div className='row subTitle'><h3>4.Early | Late | On time</h3></div>
            <div className='row subTitle'><h5>Your standup will be counted <strong>On time</strong> if you started your daily standup at your selected time +-5mins. Otherwise, it will be counted as <strong>Early</strong> or <strong>Late</strong> depending on when you started your standup</h5></div>
            <div className='row subTitle'><h3>5.The standup duration</h3></div>
            <div className='row subTitle'><h5>Even if you started the standup early, you will only have 30 minutes for the standup. If you started too late, you may have less than 30 minutes to complete your standup.</h5></div>
            <div className='row subTitle'><h3>6.Opt-out</h3></div>
            <div className='row subTitle'><h5>When you are done with your challenge or done working with the customer, go to setup and use the opt-out. Your standups will be recorded. When you're matched with a new customer or begin a new challenge, ask a Turing PM to open a new daily standup period.</h5></div>
          </div>

        </div>

      </div>
    );
  }
}


const mapStateToProps = appState => ({
  role_type_id: appState.userRoot.user.role_type_id
});

export default withRouter(connect(mapStateToProps)(DevFAQView));
