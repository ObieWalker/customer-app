const Promise = require('bluebird');
const dbPM = require('../models/dbPM');
const appActions = require('../constants/appActions');
const errorCodes = require('../constants/errorCodes');
const passport = require('../utilities/api_authentication').passport;
const bcrypt = require("bcrypt-nodejs");
const { sendEmailCustomerInvitation } = require("../utilities/sendEmail");
exports.expose = function (router) {
  exposePM(router);
}

function exposePM(router) {
  Promise.promisifyAll(dbPM);

  router.post('/pm/', , (req, res) => {
    var action = req.body.action;
    var errors = [];
    const invalidInput = (name, message = null) => errors.push({ name, message });
    switch (action) {



      case appActions.pmActions.NEW_CUSTOMER:
        let { email, name, password, sendinvitation, devs = [], driName, driEmail } = req.body;

        // hash password
        bcrypt.hash(password, null, null, function (err, hash) {
          if (!err) {

            // check If Email Existe
            dbPM.checkIfEmailExisteAsync(email).then(existe => {
              if (existe) {
                invalidInput("email", "Email already exists!");
                return false;
              } else {

                // add New Customer to db
                return dbPM.addNewCustomerAsync(name, email, hash).then(rep => {
                  let ListPromise = [];
                  if (devs && devs.length) {
                    let customerId = rep[0].user_id;
                    devs.map(devId => {
                      ListPromise.push(dbPM.addDevToMatchedAsync(devId, customerId, driName, driEmail));
                      ListPromise.push(dbPM.update_devStandupTimezone_matchedWithCustomerAsync(devId));
                    });

                  }


                  if (sendinvitation) {
                    ListPromise.push(sendEmailCustomerInvitation(name, email, password));
                  }

                  return Promise.all(ListPromise).then(r => true);
                }).then(r => true)
              }
            }).then(rep => {
              res.json({ success: rep !== false, errors });
            }).catch(err => res.json({ success: false, errors }));
          } else {
            res.json({ success: false, errors });
          }
        });
        break;

      case appActions.pmActions.UPDATE_MATCHED_LIST:
        (function () {

          let { devs, customerId, driName, driEmail } = req.body;
          dbPM.clearMatchedDevelopersAsync(customerId).then(r => {
            let ListPromise = [];
            if (devs && devs.length) {
              devs.map(devId => {
                ListPromise.push(dbPM.addDevToMatchedAsync(devId, customerId, driName, driEmail));
                ListPromise.push(dbPM.update_devStandupTimezone_matchedWithCustomerAsync(devId));
              });
            }
            return Promise.all(ListPromise);
          })
            .then(rep => res.json({ success: true }))
            .catch(err => res.json({ success: false }));


        })();
        break;

      case appActions.pmActions.GET_MATCHED_LIST:
        let { customerId } = req.body;

        dbPM.getMatchedDevelopersAsync(customerId)
          .then(rep => res.json({ list: rep, success: true }))
          .catch(err => res.json({ success: false, list: [] }));


        break;


      case appActions.pmActions.CUSTOMERS_LIST:

        let { query = "", page = 1, itemPerPage = 10 } = req.body;

        dbPM.getCustomersAsync(query, page, itemPerPage)
          .then(rep => res.json({ ...rep, success: true }))
          .catch(err => res.json({ success: false }));

        break;

      case appActions.pmActions.DEVELOPERS_LIST:
        (function () {
          var { query = "", page = 1, itemPerPage = 10 } = req.body;
          dbPM.getDevelopersAsync(query, page, itemPerPage)
            .then(rep => res.json({ ...rep, success: true }))
            .catch(err => res.json({ success: false }));
        })();
        break;





      case appActions.pmActions.RESEND_INVITATION:

        let data = req.body;

        // generate new password
        let newPassword = Math.random().toString(36).slice(-8).toUpperCase();

        bcrypt.hash(newPassword, null, null, function (err, hash) {
          if (!err) {

            // update user password in database
            return dbPM.updateUserPasswordAsync(data.email, hash).then(rep => {

              // send invitation
              return sendEmailCustomerInvitation(data.name, data.email, newPassword);
            })
              .then(rep => res.json({ success: true }))
          } else {
            res.json({ success: false });
          }
        });
        break;

      default:
        res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
    }
  });
}
