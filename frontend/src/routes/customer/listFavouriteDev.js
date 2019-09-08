import React, { Component } from 'react';
import LeftMenu from '../../components/common/LeftMenu';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import Alert from 'react-bootstrap/Alert';
import axios from 'axios';
import routeNames from '../../constants/routeNames';
import DevList from '../../components/Dashboard/views/customer/DevList';

import './listDev.css';
import 'react-day-picker/lib/style.css';

import {
  userLoggedOutAction
} from '../../reducers/userActions';

class ListFavouriteDevView extends Component {

  constructor(_props) {
    super(_props);

    this.state = {
      menu: ['All Devs', 'Favorites', 'Account', 'Log out'],
      currentPage: 0,
      itemPerPage: 10,
      developers: []
    };

    this.menuClick = this.menuClick.bind(this);
  }


  componentDidMount() {
    /* CHECK ROLE */
    if(this.props.role_type_id !== 4) {
      /* LOG OUT AND FORCE TO LOGIN PAGE */
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
      return;
    }

      this.getFavouriteDeveloperList();
  }

  getFavouriteDeveloperList() {
    var body = {
      action: 'list_favDevs',
      customerId: this.props.userId
    }
    var self = this;
    axios.post(routeNames.API_CUSTOMER, body)
    .then(function(response) {
      var data = response.data;
      if(data.success)
      {
        self.setState({ developers: data.result });
      }
    })
    .catch(function(_err){
      if(_err && _err.response  && _err.response.status === 401) {
        var action = userLoggedOutAction();
        self.props.dispatch(action);
        self.props.history.push(routeNames.LOGIN);
        return;
      }
    });
  }

  menuClick(index) {
    var toPage = this.state.menu[index];
    if (toPage === 'Account') {
      this.props.history.push(routeNames.CUSTOMER_ACCOUNT_SETTING);
    } else if(toPage === 'Favorites') {
      this.props.history.push(routeNames.CUSTOMER_FAV_DEV);
    } else if (toPage === 'All Devs') {
      this.props.history.push(routeNames.CUSTOMER_LIST_DEV);
    } else if (toPage === 'Log out') {
      var action = userLoggedOutAction();
      this.props.dispatch(action);
      this.props.history.push(routeNames.LOGIN);
    }
  }

  render() {

    var self = this;
    // used by DevList -- Mitch Kroska 4-24-2019
    const developerProps = { developers: this.state.developers, /*viewDetailDev: this.viewDetailDev*/linkTo: routeNames.CUSTOMER_VIEW_DEV, favouriteDev: this.favouriteDev, userRole: this.props.role_type_id, noFav:true }

    return (
      <div className='container h-100'>
        <div className='row h-100 w-100'>
          <div className='col-sm-12 col-md-3 h-100'>
            <LeftMenu menu={this.state.menu} selectedMenuIndex={1} menuClick={this.menuClick}/>
          </div>
          <div className='col-sm-12 col-md-9 h-100 bg-white setupView'>
            <div className='row header'><h2>Welcome {this.props.full_name ? this.props.full_name : ' Customer!'}!</h2></div>
            <div className='row subTitle'><h5>Your favourite developer list</h5></div>
            <div className={'row' + (this.state.developers.length > 0 ? '':' hidden')}><DevList {...developerProps} /></div>
            <div className={'row' + (this.state.developers.length === 0 ? '':' hidden')}><h2>No developers found!</h2></div>
          </div>
          <Alert variant={this.state.error ? 'warning' : 'success'} show={this.state.showAlert ? true : false} className='absoluteAlertMessage'>
            <p>{this.state.alertMessage}</p>
          </Alert>
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

export default withRouter(connect(mapStateToProps)(ListFavouriteDevView));
