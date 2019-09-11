const passport = require("passport");
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = require('../constants/jwtOptions').jwtOptions;
const appActions = require('../constants/appActions');
const code = require('../constants/errorCodes');
const message = require('../constants/messages');
const roles = require('../constants/roles');
const dbUsers = require('../models/dbUsers');


const strategy = new JwtStrategy(jwtOptions, function (req, jwtPayload, done) {
  dbUsers.findUserById(jwtPayload.user_id, function(err, user) {
    if (err) return done(message.UNAUTHORIZED);
    if (user) {
      const action = req.body.action;
      const role = jwtPayload.role_type_id;
      const jwtUserId = jwtPayload.user_id;
      return validActionWithRole(action, role, jwtUserId, done)
    }
  });
})
function validActionWithRole(action, role, jwtUserId, done) {
  if (role === roles.CUSTOMER) {
    return done(null, jwtUserId);
  } else if (
    action === appActions.customerActions.GET_FEEDBACK_RATE &&
    role === roles.PM
  ) {
    return done(null, jwtUserId);
  }
  else {
    return done(message.UNAUTHORIZED)
  }
}

passport.use(strategy);

exports.passport = passport;
