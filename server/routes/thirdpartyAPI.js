const Promise = require("bluebird");
const bcrypt = require("bcrypt-nodejs");
const jwt = require("jsonwebtoken");
const jwtOptions = require("../constants/jwtOptions").jwtOptions;
const appActions = require("../constants/appActions");
const errorCodes = require("../constants/errorCodes");
const dbCommon = require("../models/dbCommon");
const dbCustomer = require("../models/dbCustomer");

exports.expose = function(router) {
  exposeThirdPartyAPI(router);
}

/* QUCK SIGN-UP/SIGN-IN PROCESS */
function exposeThirdPartyAPI(router) {

  router.post('/thirdparty/', (req, res) => {
    var action = req.body.action;

    switch (action) {
      /* GENERATE SHARELINK */
      case appActions.commonActions.API_GENERATE_SHAREABLE_LINK:

        var devId = req.body.devId;
        var appName = req.body.appName;
        var hashKey = req.body.hashKey;

        Promise.promisify(dbCommon.getAPIKey);
        dbCommon.getAPIKeyAsync(appName)
        .then(function(result) {

          if(result && result.length > 0) {
            var currentKey = result[0][0].key;
            if(currentKey === hashKey) {
              /* OK */
              Promise.promisify(dbCustomer.getStandupMissed);
              dbCustomer.getStandupMissedAsync(devId)
                .then(function (result) {
                  if (result && result.length > 0) {

                    var total = result[0].totalDays;
                    var done = result[0].doneStandups;

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
                      link: `http://turing.ly/postmatch/customer/view/${devId}?sharecode=${token}`,
                      totalDays: total,
                      doneStandups: done
                    });

                  } else res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
                })
                .catch(function (error) {
                  res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
                });
            }
            else {
              res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
            }
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
}
