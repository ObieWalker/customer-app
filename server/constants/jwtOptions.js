const passportJWT = require("passport-jwt");
const ExtractJwt = passportJWT.ExtractJwt;

const jwtOptions = {
  jwtFromRequest : ExtractJwt.fromAuthHeaderWithScheme('JWT'),
  secretOrKey : '!@#$%^&*',
  passReqToCallback: true
};

exports.jwtOptions = jwtOptions;
