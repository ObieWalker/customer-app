const Promise = require('bluebird');
const dbCustomer = require('../models/dbCustomer');
const appActions = require('../constants/appActions');
const errorCodes = require('../constants/errorCodes');
const passport = require('../utilities/api_authentication').passport;
const jwt = require("jsonwebtoken");
const jwtOptions = require("../constants/jwtOptions").jwtOptions;
const { formartFeedbackRateResult } = require("../helpers");

exports.expose = function (router) {
  exposeCustomer(router);
}

function exposeCustomer(router) {

  Promise.promisifyAll(dbCustomer);

  router.post('/customer/', , (req, res) => {
    var action = req.body.action;
    let devFilter;

    switch (action) {
      /* LIST DEV */
      case appActions.customerActions.LIST_DEVS:

        var filter = req.body.filter;
        var startStandupDate = req.body.startStandupDate;
        var endStandupDate = req.body.endStandupDate;
        if (!filter) filter = '';
        if (!startStandupDate) startStandupDate = '';
        if (!endStandupDate) endStandupDate = '';
        var startItem = req.body.startItem;
        var count = req.body.count;
        if (!startItem) startItem = 0;
        if (!count) count = 10;

        devFilter = req.body.devFilter

        dbCustomer.listDevelopersAsync(filter, startStandupDate, endStandupDate, startItem, count, devFilter)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      /* FAV DEV */
      case appActions.customerActions.FAVORITE_DEV:

        var customerId = req.body.customerId;
        var devId = req.body.devId;

        dbCustomer.favouriteDevAsync(customerId, devId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.SEND_FEEDBACK_RATE:
        var customerId = req.body.customerId;
        var standupId = req.body.standupId;
        var rate = req.body.rate;
        dbCustomer.sendFeedbackRateAsync(customerId, standupId, rate)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
        break;

      case appActions.customerActions.GET_FEEDBACK_RATE:
        var standupIds = req.body.standupIds;
        var roleId = req.body.roleId;
        if (roleId === 2) {
          dbCustomer.getCustomerFeedbackRateAsync(standupIds)
            .then(function (result) {
              // formart result into array of [{rate, numberOfRate}]
              result = formartFeedbackRateResult(result);
              res.json({ success: true, result: result });
            })
            .catch(function (error) {
              res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            });
        } else {
          res.json({ success: false, errorMessage: errorCodes.UN_AUTHORIZED });
        }
        break;

      case appActions.customerActions.SEND_FEEDBACK:

        var customerId = req.body.customerId;
        var standupId = req.body.standupId;
        var feedback = req.body.feedback;


        dbCustomer.sendFeedbackAsync(customerId, standupId, feedback)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
        break;

      case appActions.customerActions.GET_FEEDBACK:

        var customerId = req.body.customerId;
        var standupId = req.body.standupId;
        var role_id = req.body.role_id;
        if (role_id === 2) {
          // if user is a PM then load all feedbacks
          dbCustomer.getAllFeedbackAsync(standupId)
            .then(function (result) {
              if (result) {
                res.json({ success: true, result: result });
              } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            })
            .catch(function (error) {
              res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            })
        } else {
          // if user is a Customer then load feedback of this Customer
          dbCustomer.getFeedbackAsync(customerId, standupId)
            .then(function (result) {
              if (result) {
                res.json({ success: true, result: result });
              } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            })
            .catch(function (error) {
              res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            })
        }


        break;


      case appActions.customerActions.LIST_FAV_DEVS:

        var customerId = req.body.customerId;

        dbCustomer.listFavouriteDevelopersAsync(customerId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.COUNT_LIST_DEVS:

        devFilter = req.body.devFilter
        var filter = req.body.filter;
        var startStandupDate = req.body.startStandupDate;
        var endStandupDate = req.body.endStandupDate;
        if (!filter) filter = '';
        if (!startStandupDate) startStandupDate = '';
        if (!endStandupDate) endStandupDate = '';

        dbCustomer.countListDevelopersAsync(filter, startStandupDate, endStandupDate, devFilter)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.GET_STANDUP_MISSED:

        var devId = req.body.devId;

        dbCustomer.getStandupMissedAsync(devId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.GET_STANDUP_TASKS_STAT_IN_RANGE:

        var devId = req.body.userId;
        var startStandupId = req.body.startStandupId;
        var endStandupId = req.body.endStandupId;

        dbCustomer.getStandupTasksStatAsync(devId, startStandupId, endStandupId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.GET_STANDUPS_BY_OPTOUT_PERIOD:

        var devId = req.body.devId;
        var optoutId = req.body.optoutId;

        dbCustomer.getStandupsByOptOutPeriodAsync(devId, optoutId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.GET_DEV_STANDUP_PERIODS:

        var devId = req.body.devId;

        dbCustomer.getDevStandupPeriodsAsync(devId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.GET_MAILING_LIST:

        var customerId = req.body.customerId;

        dbCustomer.getMailingListAsync(customerId)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      case appActions.customerActions.UPDATE_MAILING_LIST:

        var customerId = req.body.customerId;
        var mailList = req.body.mailList;

        dbCustomer.updateMailingListAsync(customerId, mailList)
          .then(function (result) {
            if (result && result.length > 0) {
              res.json({ success: true, result: result });
            } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })
          .catch(function (error) {
            res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
          })

        break;

      /* ADD SHAREABLE LINK */
      case appActions.customerActions.ADD_SHAREABLE_LINK:
        var devId = req.body.devId;
        /* GENERATE TOKEN */
        var jwtPayload = {
          devId: devId,
          shareableLink: true
        };
        var token = jwt.sign(jwtPayload, jwtOptions.secretOrKey, {
          expiresIn: "7d"
        });

        res.json({
          success: true,
          token: token
        });

        break;

      default:
        res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
    }
  });
}
