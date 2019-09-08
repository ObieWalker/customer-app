const Promise = require('bluebird');
const dbCommon = require('../models/dbCommon');
const appActions = require('../constants/appActions');
const errorCodes = require('../constants/errorCodes');
const dbUsers = require('../models/dbUsers');

exports.expose = function(router) {
  exposeCommon(router);
}

/* VERIFICATION PROCESS FOR EMAIL */
function exposeCommon(router) {

  Promise.promisifyAll(dbCommon);

  router.post('/verification-email', (req, res) => {
    const email = req.body.email;
    const token = req.body.token;
    dbUsers.updateUserAsVerifiedAsync(email, token)
    .then(function(result) {
      if(result && result[0].result == 1) {
         res.json({ success: true, result: result.result });
      } else res.json({ success: false, errorMessage: errorCodes.login.ACCOUNT_NOT_EXISTS });
    }).catch(function(error) {
      res.json({ success: false, errorMessage: errorCodes.BAD_REQUEST });
    })        

  });
}



