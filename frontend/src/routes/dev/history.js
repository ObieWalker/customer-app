import React, { Component } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import routeNames from '../../constants/routeNames';
import StandupEntries from '../../components/dev/standupEntries';
import "./setup.css";

import {
  userLoggedOutAction
} from '../../reducers/userActions';

class DevHistory extends Component {

  componentDidMount() {
    /* CHECK ROLE */
    if(this.props.role_type_id !== 3) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }
  }


  render() {

    return (
      <div className='container fillHeight'>
        <div className='row w-100 fillHeight'>
          <div className='col-sm-12 col-md-3 fillHeight'>
            <LeftMenu />
          </div>
          <div className="col-sm-12 col-md-9 setupView">
            <StandupEntries usefor='dev' />
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

export default withRouter(connect(mapStateToProps)(DevHistory));
