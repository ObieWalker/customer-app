const errorCodes = {
  BAD_REQUEST: 'Bad Request',
  UN_AUTHORIZED: 'Unauthorize',
  /* LOGIN FLOW */
  login : {
    ACCOUNT_NOT_EXISTS: 'This account does not exist',
    PASSWORD_NOT_MATCH: 'Password did not match',
    EMAIL_EXISTED: 'Email already exists',
    EMAIL_NOT_VERIFIED: 'Please verify your email'
  }
}

module.exports = errorCodes;
