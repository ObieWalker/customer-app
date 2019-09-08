import {
  USER_LOGGED_IN,
  USER_LOGGED_OUT,
  USER_UPDATE_NAME_AND_SETUP_ID
} from './userActions';

const initialState = { user: { } } ;

function userRoot(state = initialState, action) {

  switch (action.type) {
    case USER_LOGGED_IN:

      state.user = { 
        id: action.id, 
        email: action.email, 
        full_name: action.full_name, 
        role_type_id: action.role_type_id, 
        setupId: action.setupId, 
        token: action.token, 
        expires: action.expires,
        login_type: action.login_type 
      };
      return {...state};

    case USER_LOGGED_OUT:

        state.user = {};        
        return {...state};

    case USER_UPDATE_NAME_AND_SETUP_ID:

      state.user.full_name = action.full_name;
      state.user.setupId = action.id;

      return {...state};
    default:
      return state;
  }
}

export default userRoot;
