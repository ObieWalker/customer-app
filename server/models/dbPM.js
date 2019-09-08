const util = require('../utilities/util');



function addNewCustomer(name, email, password, callback) {
  var sqlstr = `CALL create_new_user(?,?,?,?,?)`;
  return util.executeSQL(sqlstr, [email, password, name, 4, 1])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}

function checkIfEmailExiste(email, callback) {
  var sqlstr = `CALL get_userid_by_email(?)`;
  return util.executeSQL(sqlstr, [email])
    .then(res => callback(null, res[0].length > 0))
    .catch(error => callback(error, null))
}

function updateUserPassword(email, password, callback) {
  var sqlstr = `CALL update_password_user(?,?)`;
  return util.executeSQL(sqlstr, [email, password])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}


function getCustomers(name_or_email_filter, page, itemPerPage, callback) {
  var CustomerRoleTypeID = 4;
  var sqlstr = `CALL get_customers(?,?,?,?)`;
  var startAtIndex = (page - 1) * itemPerPage;
  return util.executeSQL(sqlstr, [name_or_email_filter, CustomerRoleTypeID, startAtIndex, itemPerPage])
    .then(([res1, infos]) => {
      var sqlCountStr = `CALL count_customers(?,?)`;
      return util.executeSQL(sqlCountStr, [name_or_email_filter, CustomerRoleTypeID])
        .then(([res2, infos]) => {
          callback(null, {
            count: res2[0].count,
            nbrPages: Math.ceil(res2[0].count / itemPerPage),
            list: res1
          });
        })
        .catch(error => callback(error, null))
    })
    .catch(error => callback(error, null))
}

function getDevelopers(name_or_email_filter, page, itemPerPage, callback) {
  var DeveloperRoleTypeID = 3;
  var sqlstr = `CALL get_users_by_role(?,?,?,?)`;
  var startAtIndex = (page - 1) * itemPerPage;
  return util.executeSQL(sqlstr, [name_or_email_filter, DeveloperRoleTypeID, startAtIndex, itemPerPage])
    .then(([res1, infos]) => {
      var sqlCountStr = `CALL count_users_by_role(?,?)`;
      return util.executeSQL(sqlCountStr, [name_or_email_filter, DeveloperRoleTypeID])
        .then(([res2, infos]) => {
          callback(null, {
            count: res2[0].count,
            nbrPages: Math.ceil(res2[0].count / itemPerPage),
            list: res1
          });
        })
        .catch(error => callback(error, null))
    })
    .catch(error => callback(error, null))
}


function addDevToMatched(DevId, CustomerId, DRIName, DRIEmail, callback) {
  var sqlstr = `CALL add_dev_to_matched(?,?,?,?)`;

  return util.executeSQL(sqlstr, [DevId, CustomerId, DRIName, DRIEmail])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}


function update_devStandupTimezone_matchedWithCustomer(DevId, callback) {
  var sqlstr = `CALL update_developer_standup_timezone_matched_with_customer(?)`;
  return util.executeSQL(sqlstr, [DevId])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}


function getMatchedDevelopers(idCustomer, callback) {
  var sqlstr = `CALL get_matched_list(?)`;
  return util.executeSQL(sqlstr, [idCustomer])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}

function clearMatchedDevelopers(idCustomer, callback) {
  var sqlstr = `CALL clear_matched_list(?)`;
  return util.executeSQL(sqlstr, [idCustomer])
    .then(res => callback(null, res[0]))
    .catch(error => callback(error, null))
}

const dbPM = {
  addNewCustomer,
  checkIfEmailExiste,
  getCustomers,
  updateUserPassword,
  getDevelopers,
  addDevToMatched,
  update_devStandupTimezone_matchedWithCustomer,
  getMatchedDevelopers,
  clearMatchedDevelopers
};

module.exports = dbPM;
