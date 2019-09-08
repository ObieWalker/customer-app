const passport = require("passport");
const passportJWT = require("passport-jwt");
const JwtStrategy = passportJWT.Strategy;
const jwtOptions = require('../constants/jwtOptions').jwtOptions;
const appActions = require('../constants/appActions');

const strategy = new JwtStrategy(jwtOptions, function (request, jwtPayload, next) {

});


function validActionWithRole(action, role, jwtUserId, actionUserId) {

}

passport.use(strategy);

exports.passport = passport;
