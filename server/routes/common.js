const Promise = require("bluebird");
const passport = require('../utilities/api_authentication').passport;
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-random-string");
const jwtOptions = require("../constants/jwtOptions").jwtOptions;
const dbUsers = require("../models/dbUsers");
const appActions = require("../constants/appActions");
const errorCodes = require("../constants/errorCodes");
const dbCommon = require("../models/dbCommon");

const {
  sendVerificationEmail
} = require("../utilities/send_verification_email");

exports.expose = function(router) {
  exposeCommon(router);
}

/* QUCK SIGN-UP/SIGN-IN PROCESS */
function exposeCommon(router) {

  Promise.promisifyAll(dbCommon);

  router.post('/common/', (req, res) => {
    var action = req.body.action;

    switch (action) {
      /* LIST TIMEZONES */
      case appActions.commonActions.LIST_TIMEZONES:

        dbCommon.listTimeZonesAsync()
        .then(function(result) {
          if(result && result.length > 0)
          {
            res.json({ success: true, result: result });
          }
          else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
        })
        .catch(function(error) {
          res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
        })

        break;

      default:
        res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
    }
  });

  router.post('/account/', (req, res) => {
    var action = req.body.action;
    var email = req.body.email;

    switch(action){
      /* LOGIN */
      case appActions.userActions.LOGIN:
        var password = req.body.password;

        dbUsers
          .loginAsync(email)
          .then(function(result) {
            if (result && result.length > 0) {
              /* TEMPORARY REMOVE - turing.ly EXISTED USERS DIDN'T VERIFIED EMAIL, BUT WE STILL HAVE TO LET THEM IN
            if(!result[0].is_verified){
              return res.json({ success: false, errorMessage: errorCodes.login.EMAIL_NOT_VERIFIED });
            }
            */
              bcrypt.compare(password, result[0].password, function(e, r) {
                if (r) {
                  result[0].password = "";
                  /* Add login type */
                  /* TOKEN */
                  var jwtPayload = {
                    email: result[0].email,
                    full_name: result[0].full_name,
                    role_type_id: result[0].role_type_id,
                    user_id: result[0].id
                  };
                  var token = jwt.sign(jwtPayload, jwtOptions.secretOrKey, {
                    expiresIn: "3d"
                  });
                  var expires = new Date();
                  expires.setHours(expires.getHours() + 24 * 3);

                  res.json({
                    success: true,
                    token: token,
                    expires: expires,
                    result: result
                  });
                } else {
                  res.json({
                    success: false,
                    errorMessage: errorCodes.login.PASSWORD_NOT_MATCH
                  });
                }
              });
            } else
              res.json({
                success: false,
                errorMessage: errorCodes.login.ACCOUNT_NOT_EXISTS
              });
          })
          .catch(function(error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;
      /* LOGIN WITH SOCIAL */
      case appActions.userActions.LOGIN_GOOGLE:
      case appActions.userActions.LOGIN_FACEBOOK:
        var gid = req.body.gid;
        var fbid = req.body.fbid;
        var full_name = req.body.full_name;

        dbUsers
          .loginWithSocialIdAsync(email, gid, fbid, full_name)
          .then(function(result) {
            if (result && result.length > 0) {
              /* TOKEN */
              var jwtPayload = {
                email: result[0].email,
                full_name: result[0].full_name,
                role_type_id: result[0].role_type_id,
                user_id: result[0].id
              };
              var token = jwt.sign(jwtPayload, jwtOptions.secretOrKey, {
                expiresIn: "3d"
              });
              var expires = new Date();
              expires.setHours(expires.getHours() + 24 * 3);

              res.json({
                success: true,
                token: token,
                expires: expires,
                result: result
              });
            } else res.json({ success: false, errorMessage: errorCodes.login.ACCOUNT_NOT_EXISTS });
          })
          .catch(function(error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      case appActions.userActions.SIGN_UP:
        var email = req.body.email;
        var password = req.body.password;
        var full_name = req.body.full_name;
        bcrypt.hash(password, null, null, function(err, hash) {
          if (!err) {
            dbUsers
              .signupAsync(email, hash, full_name)
              .then(function(result) {
                if (result && result.length > 0 && result[0].result === 1) {
                  const token = crypto(16);
                  dbUsers
                    .createEmailVerificationTokenAsync(
                      email,
                      token,
                      result[0].user_id
                    )
                    .then(function(resp) {
                      // send verification link to user email
                      sendVerificationEmail(email, token);
                      res.json({ success: true, result: result });
                    })
                    .catch(function(er) {
                      res.json({
                        success: false,
                        errorMessage: errorCodes.BAD_REQUEST
                      });
                    });
                } else
                  res.json({
                    success: false,
                    errorMessage: errorCodes.login.EMAIL_EXISTED
                  });
              })
              .catch(function(error) {
                res.json({
                  success: false,
                  errorMessage: errorCodes.BAD_REQUEST
                });
              });
          } else {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          }
        });

        break;

      case appActions.userActions.SIGN_UP_SOCIAL:
        var email = req.body.email;
        var full_name = req.body.full_name;
        var fid = req.body.fid;
        var gid = req.body.gid;

        dbUsers
          .signupSocialAsync(email, full_name, gid, fid)
          .then(function(result) {
            if (result && result.length > 0 && result[0].result === 1) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.login.EMAIL_EXISTED });
          })
          .catch(function(error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      default:
        res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });

    }
  });
}
