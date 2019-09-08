import { combineReducers } from 'redux';
import userRoot from './userReducer';

const devStanupApp = combineReducers( {
  'userRoot' : userRoot
});

export default devStanupApp;
