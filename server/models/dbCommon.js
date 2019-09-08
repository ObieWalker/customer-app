const util = require('../utilities/util');

function listTimeZones(callback) {

  var sqlstr = `CALL listTimezones();`;

  util.executeSQL(sqlstr)
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'name', 'abbreviation', 'utcOffset' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getAPIKey(appName, callback) {
  var sqlstr = `CALL get_shareable_api_key(?);`;

  util.executeSQL(sqlstr,[appName])
  .then(function(allRows) {
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

const dbCommon = {
  listTimeZones: listTimeZones,
  getAPIKey: getAPIKey
}

module.exports = dbCommon;
