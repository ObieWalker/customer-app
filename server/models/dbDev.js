const util = require('../utilities/util');

function setupStandupTimeZone(userId, timezone, time, full_name, callback) {

  var sqlstr = `CALL update_dev_standup_timezone(?,?,?,?);`;

  util.executeSQL(sqlstr,[userId, timezone, time, full_name])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })

}

function listSetupStandupTime(userId, callback) {

  var sqlstr = `CALL list_setup_standup_time(?);`;

  util.executeSQL(sqlstr,[userId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'userId', 'timezone', 'hour' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function checkForValidStandupTime(userId, callback) {
  var sqlstr = `SELECT * FROM developer_standup_timezone_v2 WHERE id = ?`;

  util.executeSQL(sqlstr,[userId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'userId', 'timezone', 'hour' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getStandupPlanTasks(userId, callback) {

  var sqlstr = `CALL get_standup_plan_tasks(?);`;

  util.executeSQL(sqlstr,[userId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'name', 'time_estimate', 'changes', 'new_estimate', 'completed', 'initialTask' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getStandupPlanTasksByStandupId(standupId, callback) {

  var sqlstr = `CALL get_standup_plan_tasks_by_standup_id(?);`;

  util.executeSQL(sqlstr,[standupId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'name', 'time_estimate', 'changes', 'new_estimate', 'completed', 'initialTask' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function saveStandup(userId, earlyOrLate, answers, tasks, estimates, changedTaskIds, changes, completedTaskIds, new_estimates, initialTasks, callback) {

    var sqlstr = `CALL save_standup_bulk(?,?,?,?,?,?,?,?,?,?);`;

    util.executeSQL(sqlstr,[userId, earlyOrLate, answers, tasks, estimates, changedTaskIds, changes, completedTaskIds, new_estimates, initialTasks])
    .then(function(allRows) {

        if(allRows.length > 0) callback(null, allRows);
        else callback(null, null);

    })
    .catch(function(error) {
      callback(error, null);
    });
}

function getStandupAnswers(standupId, callback) {

  var sqlstr = `CALL get_standup_answer(?);`;

  util.executeSQL(sqlstr,[standupId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'question_id', 'answer' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getStandups(userId, page, itempp, callback) {

  var sqlstr = `CALL get_standups(?,?,?);`;

  util.executeSQL(sqlstr,[userId, page, itempp])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'standupId', 'userId', 'created_date', 'earlyOrLate' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getFeedbackByStandup(standupId, callback) {

  var sqlstr = `CALL get_feedback_by_standup(?);`;

  util.executeSQL(sqlstr,[standupId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'customer_id', 'feedback' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function devOptOut(userId, callback) {
  var sqlstr = `CALL set_dev_opt_out(?);`;

  util.executeSQL(sqlstr,[userId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

function getMailingListByDev(devId, callback) {
  var sqlstr = `CALL get_mailing_list_by_dev(?);`;

  util.executeSQL(sqlstr,[devId])
  .then(function(allRows) {

    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'developerName', 'mailListTPM', 'mailListCustomer', 'matchedWithCustomer', 'driEmail' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

const dbDev = {
  setupStandupTimeZone: setupStandupTimeZone,
  listSetupStandupTime: listSetupStandupTime,
  checkForValidStandupTime: checkForValidStandupTime,
  getStandupPlanTasks: getStandupPlanTasks,
  getStandupPlanTasksByStandupId: getStandupPlanTasksByStandupId,
  saveStandup: saveStandup,
  getStandupAnswers: getStandupAnswers,
  getStandups: getStandups,
  getFeedbackByStandup: getFeedbackByStandup,
  devOptOut: devOptOut,
  getMailingListByDev: getMailingListByDev
}

module.exports = dbDev;
