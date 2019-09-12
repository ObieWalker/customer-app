import { combineReducers } from 'redux';
import userRoot from './userReducer';
import customer from './customerReducer';

const devStanupApp = combineReducers( {
  'userRoot' : userRoot,
  customer
});

export default devStanupApp;
