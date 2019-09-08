const Promise = require("bluebird");
const passport = require('../utilities/api_authentication').passport;
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto-random-string");
const jwtOptions = require("../constants/jwtOptions").jwtOptions;
const dbUsers = require("../models/dbUsers");
const appActions = require("../constants/appActions");
const errorCodes = require("../constants/errorCodes");
const {
  sendVerificationEmail
} = require("../utilities/send_verification_email");

exports.expose = function (router) {
  exposeUsers(router);
};

/* QUCK SIGN-UP/SIGN-IN PROCESS */
function exposeUsers(router) {
  Promise.promisifyAll(dbUsers);

  router.post("/user/", (req, res) => {
    var action = req.body.action;
    var email = req.body.email;

    switch (action) {

      case appActions.userActions.USER_UPDATE:

        var full_name = req.body.full_name;
        var currentPassword = req.body.currentPassword;
        var newPassword = req.body.newPassword;
        var userId = req.body.userId;
        dbUsers
          .findUserByIdAsync(userId)
          .then(function (result) {
            if (result[0].password === "" && (result[0].google_id !== null || result[0].fb_id !== null)) {
              bcrypt.hash(newPassword, null, null, function (err, hash) {
                if (!err) {
                  dbUsers
                    .updateUserAsync(userId, full_name, hash)
                    .then(function (response) {
                      res.json({ success: true, result: response });
                    })
                    .catch(function (e) {
                      res.json({
                        success: false,
                        errorMessage: errorCodes.BAD_REQUEST
                      });
                    });
                }
              });
            } else {

              bcrypt.compare(currentPassword, result[0].password, function (
                err,
                resp
              ) {
                if (resp) {
                  bcrypt.hash(newPassword, null, null, function (err, hash) {
                    if (!err) {
                      dbUsers
                        .updateUserAsync(userId, full_name, hash)
                        .then(function (response) {
                          res.json({ success: true, result: response });
                        })
                        .catch(function (e) {
                          res.json({
                            success: false,
                            errorMessage: errorCodes.BAD_REQUEST
                          });
                        });
                    }
                  });
                } else {
                  res.json({
                    success: false,
                    errorMessage: errorCodes.login.PASSWORD_NOT_MATCH
                  });
                }
              });
            }
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      case appActions.userActions.GET_USER_INFO:
        var userId = req.body.userId;

        dbUsers
          .getUserInfoAsync(userId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.login.ACCOUNT_NOT_EXISTS });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      default:
        res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
    }
  });
}
