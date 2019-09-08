/* ACTION TYPES */
export const USER_LOGGED_IN = 'USER_LOGGED_IN';
export const USER_LOGGED_OUT = 'USER_LOGGED_OUT';
export const USER_UPDATE_NAME_AND_SETUP_ID = 'UPDATE_NAME_AND_SETUP_ID';

/* ACTION CREATORS */
export function userLoggedInAction(id, email, full_name, role_type_id, setupId, token, expires, login_type = null) {
  return { type : USER_LOGGED_IN, id, email, full_name, role_type_id, setupId, token, expires, login_type }
}

export function userLoggedOutAction() {
  return { type : USER_LOGGED_OUT }
}

export function userUpdateNameAndSetupIDAction(id, full_name) {
  return { type : USER_UPDATE_NAME_AND_SETUP_ID, id, full_name }
}
