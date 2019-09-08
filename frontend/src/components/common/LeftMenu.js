import React, { Component } from 'react';
import { NavLink, Link } from "react-router-dom";
import { connect } from 'react-redux';
import routeNames from '../../constants/routeNames';
import {
  userLoggedOutAction
} from '../../reducers/userActions';

import './LeftMenu.css';

class LeftMenu extends Component {

  render() {
    return (
      <div className='container-fluid h-100 leftMenu'>
        <br/>
        <div className='row logo'></div>
        <div className='row title'><h2>Turing</h2></div>
        <div className='row separator'></div>

        {this.props.currentUser.role_type_id === 3 && ( <div>
          <div className='row menu'>
            <NavLink
              to={routeNames.DEVELOPER_SETUP}
              className="app-nav-item"
              activeClassName="active"
            >
              Set up
            </NavLink>
          </div>

          <div className='row menu'>
            <NavLink
            to={routeNames.DEVELOPER_STANDUP}
            className="app-nav-item"
              activeClassName="active"
            >
              Stand up
            </NavLink>
          </div>

          <div className='row menu'>
            <NavLink
            to={routeNames.DEVELOPER_HISTORY}
              className="app-nav-item"
              activeClassName="active"
            >
              History
            </NavLink>
          </div>

          <div className='row menu'>
            <NavLink
            to={routeNames.DEVELOPER_FAQ}
              className="app-nav-item"
              activeClassName="active"
            >
              FAQ
            </NavLink>
          </div>
        </div>)}


        {this.props.currentUser.role_type_id === 4 && (<div>
         
          <div className='row menu'>
            <NavLink
            to={routeNames.CUSTOMER_MATCHED_DEV}
              className="app-nav-item"
              activeClassName="active"
            >
              Matched
            </NavLink>
          </div>
          
          <div className='row menu'>
            <NavLink
            to={routeNames.CUSTOMER_LIST_DEV}
              className="app-nav-item"
              activeClassName="active"
            >
              All Devs
            </NavLink>
          </div>
       
      
          <div className='row menu'>
            <NavLink
            to={routeNames.CUSTOMER_FAV_DEV}
              className="app-nav-item"
              activeClassName="active"
            >
              Favorites
            </NavLink>
          </div>
        </div>)}

        {this.props.currentUser.role_type_id === 2 && (
          <>
          <div className='row menu'>
            <NavLink
              to={routeNames.CUSTOMER_LIST_DEV}
              className="app-nav-item"
              activeClassName="active"
            >
              All Devs
            </NavLink>
          </div>

          <div className='row menu'>
            <NavLink
              to={routeNames.PM_CUSTOMER_LIST}
              className="app-nav-item"
              activeClassName="active"
            >
              Customers
            </NavLink>
          </div>
            <div className='row menu'>
              <NavLink
                to={routeNames.PM_CUSTOMER_SETUP}
                className="app-nav-item"
                activeClassName="active"
              >
                Setup Customer
            </NavLink>
            </div>
          </>
        )}

        <div className='row menu'>
          <NavLink
          to={routeNames.ACCOUNT_SETTING}
            className="app-nav-item"
            activeClassName="active"
          >
            Account
          </NavLink>
        </div>

        <div className='row menu'>
          <Link
            className="app-nav-item"
            onClick={() => {
              var action = userLoggedOutAction();
              this.props.dispatch(action);
            }}
            to={`/`}
          >
            Logout
          </Link>
        </div>
      </div>
    );
  }
}

const mapStateToProps = appState => ({
  currentUser: appState.userRoot.user
});

export default connect(mapStateToProps)(LeftMenu);
