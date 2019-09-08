const Promise = require('bluebird');
const passport = require('../utilities/api_authentication').passport;
const dbDev = require('../models/dbDev');
const appActions = require('../constants/appActions');
const errorCodes = require('../constants/errorCodes');
const { sendStandupNotificationEmails } = require("../utilities/sendEmail");

exports.expose = function (router) {
  exposeDev(router);
}

/* QUCK SIGN-UP/SIGN-IN PROCESS */
function exposeDev(router) {

  Promise.promisifyAll(dbDev);

  router.post('/dev/', (req, res) => {
    var action = req.body.action;

    switch (action) {
      /* SETUP */
      case appActions.devActions.SETUP_STANDUP_TIME:

        var userId = req.body.userId;
        var timeZone = req.body.timeZone;
        var time = req.body.time;
        var full_name = req.body.full_name;

        dbDev.setupStandupTimeZoneAsync(userId, timeZone, time, full_name)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* RETRIEVE WHAT WAS SETUP'D */
      case appActions.devActions.LIST_STANDUP_TIME:

        var userId = req.body.userId;

        dbDev.listSetupStandupTimeAsync(userId)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* CHECK VALID TIME FOR STANDUP */
      case appActions.devActions.CHECK_VALID_STANDUP_TIME:

        var userId = req.body.userId;

        

        break;

      /* GET STANDUP PLAN TASK BY DATE */
      case appActions.devActions.GET_STANDUP_PLAN_TASKS:

        var userId = req.body.userId;

        dbDev.getStandupPlanTasksAsync(userId)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      case appActions.devActions.GET_STANDUP_PLAN_TASKS_BY_STANDUP_ID:

        var standupId = req.body.standupId;

        dbDev.getStandupPlanTasksByStandupIdAsync(standupId)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* SAVE STANDUP */
      case appActions.devActions.SAVE_STANDUP:

        var userId = req.body.userId;
        var earlyOrLate = req.body.earlyOrLate;
        var answers = req.body.answers;
        var tasks = req.body.tasks;
        var estimates = req.body.estimates;
        var changedTaskIds = req.body.changedTaskIds;
        var changes = req.body.changes;
        var completedTaskIds = req.body.completedTaskIds;
        var new_estimates = req.body.new_estimates;
        var initialTasks = req.body.initialTasks;
        var completes = req.body.completes;

        dbDev.saveStandupAsync(userId, earlyOrLate, answers, tasks, estimates, changedTaskIds, changes, completedTaskIds, new_estimates, initialTasks)
          .then(function (result) {
            if (result && result.length > 0 && result[0].length > 0) {
              var standupId = result[0][0].standupId;
              res.json({ success: true, result: result });
              /* FIRE THE EMAIL NOTIFICATION */
              dbDev.getMailingListByDevAsync(userId).then(function (result) {
                if (result.length > 0) {
                  if (result[0].matchedWithCustomer === 1) {
                    var devName = result[0].developerName;
                    var customerId = result[0].customerId;
                    /* GET THE LAST CUSTOMER ID ONLY */
                    if(customerId) {
                      var comps = customerId.split(',');
                      if(comps.length > 0) customerId = comps[comps.length - 1];
                    }

                    if(devName) {
                      var comps = devName.split(' ');
                      if(comps && comps.length > 0) devName = comps[0];
                    }
                    var mailListTPM = result[0].mailListTPM;
                    var mailListCustomer = result[0].mailListCustomer;
                    var driEmail = result[0].driEmail;

                    sendStandupNotificationEmails(userId, customerId, standupId, devName, answers, tasks, estimates, initialTasks, completes, mailListTPM, mailListCustomer, driEmail);

                  }
                }
              });
            }
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* SAVE STANDUP */
      case appActions.devActions.GET_STANDUP_ANSWERS:

        var standupId = req.body.standupId;

        dbDev.getStandupAnswersAsync(standupId)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* GET STANDUPS */
      case appActions.devActions.GET_STANDUPS:

        var userId = req.body.userId;
        var page = req.body.page;
        var itempp = req.body.itempp;
        if (!page) page = 0;
        if (!itempp) itempp = 10;

        dbDev.getStandupsAsync(userId, page, itempp)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* GET FEEDBACK BY STANDUP ID */
      case appActions.devActions.GET_FEEDBACK_BY_STANDUP:

        var standupId = req.body.standupId;

        dbDev.getFeedbackByStandupAsync(standupId)
          .then(function (result) {
            if (result) res.json({ success: true, result: result });
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          });

        break;

      /* OPT OUT */
      case appActions.devActions.OPT_OUT:

        var userId = req.body.userId;

        dbDev.devOptOutAsync(userId)
          .then(function (result) {
            if (result) {
              res.json({ success: true, result: result });
            }
            else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
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
