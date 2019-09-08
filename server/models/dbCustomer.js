const util = require('../utilities/util');

function listDevelopers(filterName, startStandupDate, endStandupDate, startItem, count, devFilter, callback) {
  let sqlstr;
  if (devFilter === "activeDevelopers") {
    sqlstr = `CALL get_dev_list_standup_only(?,?,?,?,?);`;
  } else if (devFilter === "allDevelopers") {
    sqlstr = `CALL get_dev_list(?,?,?,?,?);`;
  }

  util.executeSQL(sqlstr, [filterName, startStandupDate, endStandupDate, startItem, count])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'email', 'full_name', 'role_type_id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}

/**
 * @author Mitch Kroska mitch.k@turing
 * @creation-date 4-24-2019
 * @desc based on the query returns the count of devs that match the query
 * @return Array - [allDevsCount, activeDevsCount]
 */
function countListDevelopers(filterName, startStandupDate, endStandupDate, devFilter, callback) {

  const sqlstrStandup = `CALL count_dev_list_standup(?,?,?);`;
  const sqlstrAll = `CALL count_dev_list(?,?,?);`;

  let devAllProm = util.executeSQL(sqlstrAll, [filterName, startStandupDate, endStandupDate])
  let devStandupProm = util.executeSQL(sqlstrStandup, [filterName, startStandupDate, endStandupDate])

  const promise = Promise.all([devAllProm, devStandupProm])

  promise.then(results => {
    const counts = []
    results.forEach((result) => { counts.push(result[0][0].count) })
    callback(null, counts)

  }).catch(function (error) {
    callback(error, null)
  });
}

function listFavouriteDevelopers(customerId, callback) {

  var sqlstr = `CALL get_fav_dev_list(?);`;

  util.executeSQL(sqlstr, [customerId])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'email', 'full_name', 'role_type_id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}

function favouriteDev(customerId, devId, callback) {

  var sqlstr = `CALL favorite_dev(?,?);`;

  util.executeSQL(sqlstr, [customerId, devId])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}

function getCustomerFeedbackRate(standupIds, callback) {
  var sqlstr = `CALL get_customer_standup_rates(?);`;
  // As db expects standupIds to be integers, remove non-integer values
  // Also, convert standupIds to string as arrays
  // can't be pass as a parameter to stored procedure
  standupIds = standupIds.filter(standupId => parseInt(standupId, 10)).join(',');

  util.executeSQL(sqlstr, [standupIds])
    .then(function (allRows) {
      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}

function sendFeedbackRate(customerId, standupId, rate, callback) {
  var sqlstr = `CALL update_rate_to_standup(?,?,?);`;

  util.executeSQL(sqlstr, [customerId, standupId, rate])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}
function sendFeedback(customerId, standupId, feedback, callback) {

  var sqlstr = `CALL update_comment_to_standup(?,?,?);`;

  util.executeSQL(sqlstr, [customerId, standupId, feedback])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}


function getAllFeedback(standupId, callback) {

  var sqlstr = `CALL get_all_customer_comment_on_standup(?);`;

  util.executeSQL(sqlstr, [standupId])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'customer_id', 'standup_id', 'feedback', 'rate'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}

function getFeedback(customerId, standupId, callback) {

  var sqlstr = `CALL get_customer_comment_on_standup(?,?);`;

  util.executeSQL(sqlstr, [customerId, standupId])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'customer_id', 'standup_id', 'feedback', 'rate'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}


function getStandupMissed(devId, callback) {

  var sqlstr = `CALL get_standup_missed(?);`;
  util.executeSQL(sqlstr, [devId])
    .then(function (allRows) {
      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['totalDays', 'doneStandups'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })

}

function getStandupTasksStat(devId, startStandupId, endStandupId, callback) {
  var sqlstr = `CALL get_standup_tasks_stat_in_range(?,?,?);`;
  util.executeSQL(sqlstr, [devId, startStandupId, endStandupId])
    .then(function (allRows) {
      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'standupId', 'time_estimate', 'new_estimate', 'completed', 'initialTask'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}

function getStandupsByOptOutPeriod(devId, optoutId, callback) {
  var sqlstr = `CALL get_standups_by_optout_period(?,?);`;
  util.executeSQL(sqlstr, [devId, optoutId])
    .then(function (allRows) {
      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['standupId', 'userId', 'created_date', 'earlyOrLate', 'startFromSetupDate', 'endAtOptoutDate'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}

function getDevStandupPeriods(devId, callback) {
  var sqlstr = `CALL get_dev_standup_periods(?);`;
  util.executeSQL(sqlstr, [devId])
    .then(function (allRows) {
      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'devId', 'setupDate', 'optoutDate'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}


function getMailingList(customerId, callback) {

  var sqlstr = `CALL customer_get_current_mailing_list(?);`;

  util.executeSQL(sqlstr, [customerId])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['id', 'customer_id', 'name', 'email'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}

function updateMailingList(customerId, mailList, callback) {

  var sqlstr = `CALL customer_update_mailing_list(?,?);`;

  util.executeSQL(sqlstr, [customerId, mailList])
    .then(function (allRows) {

      if (util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson(['insertCount'], allRows);
      callback(null, allRows);
    })
    .catch(function (error) {
      callback(error, null);
    })
}


const dbCustomer = {
  listDevelopers: listDevelopers,
  favouriteDev: favouriteDev,
  sendFeedback: sendFeedback,
  sendFeedbackRate: sendFeedbackRate,
  getCustomerFeedbackRate: getCustomerFeedbackRate,
  getFeedback: getFeedback,
  listFavouriteDevelopers: listFavouriteDevelopers,
  countListDevelopers: countListDevelopers,
  getStandupMissed: getStandupMissed,
  getStandupTasksStat: getStandupTasksStat,
  getStandupsByOptOutPeriod: getStandupsByOptOutPeriod,
  getDevStandupPeriods: getDevStandupPeriods,
  getAllFeedback: getAllFeedback,
  getMailingList: getMailingList,
  updateMailingList: updateMailingList
}

module.exports = dbCustomer;
