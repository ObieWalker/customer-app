import React, { Component } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import routeNames from '../../constants/routeNames';
import StandupEntries from '../../components/dev/standupEntries';

import {
  userLoggedOutAction
} from '../../reducers/userActions';

class DevStandupDetailView extends Component {

  constructor(props) {
    super(props);
    this.state = {
      menu: ['All Devs.', 'Favorites', 'Matched', 'Log out']
    };
    this.menuClick = this.menuClick.bind(this);
  }

  componentDidMount() {
    /* CHECK ROLE */
    if (this.props.role_type_id !== 4 && this.props.role_type_id !== 2) {
      /* CHECK IF IT A SHAREABLE LINK */
      var url = new URL(window.location.href);
      var sharecode = url.searchParams.get('sharecode');
      if (sharecode) {
        /* CLIENT SIDE ALLOW TO GO THROUGH, WILL CHECK HASHCODE IN SERVER SIDE */
        this.setState({ nomenu: true });
        return;
      }

      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }
  }

  menuClick(index) {
    var toPage = this.state.menu[index];
    if (toPage === 'Favorites') {
      this.props.history.push(routeNames.CUSTOMER_FAV_DEV);
    }
    else if (toPage === 'All Devs.') {
      this.props.history.push(routeNames.CUSTOMER_LIST_DEV);
    }
    else if (toPage === 'Log out') {
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
    }
  }

  render() {

    return (
      <div className='container'>
        <div className='row '>
          <div className='col-sm-12 col-md-3 fillHeight'>
            {!this.state.nomenu && (
              <LeftMenu
                menu={this.state.menu}
                selectedMenuIndex={3}
                menuClick={this.menuClick}
              />
            )}
          </div>
          <div className="col-sm-12 col-md-9 setupView bg-light">
            <StandupEntries
              usefor='customer'
              devId={this.props.match.params.devId}
            />
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

export default withRouter(connect(mapStateToProps)(DevStandupDetailView));
