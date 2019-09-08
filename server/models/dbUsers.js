const util = require("../utilities/util");

function login(email, callback) {
  var sqlstr = `CALL login(?);`;

  util
    .executeSQL(sqlstr, [email])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(
          [
            "id",
            "email",
            "full_name",
            "role_type_id",
            "password",
            "setupId",
            "is_verified"
          ],
          allRows
        );
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function loginWithSocialId(email, gid, fbid, full_name, callback) {
  var sqlstr = `CALL login_with_socialId(?,?,?,?);`;

  util
    .executeSQL(sqlstr, [email, gid, fbid, full_name])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(
          ["id", "email", "full_name", "role_type_id", "setupId"],
          allRows
        );
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function signup(email, password, full_name, callback) {
  var sqlstr = `CALL dev_signup(?,?,?);`;

  util
    .executeSQL(sqlstr, [email, password, full_name])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function signupSocial(email, full_name, gid, fid, callback) {
  var sqlstr = `CALL dev_social_signup(?,?,?,?);`;

  util
    .executeSQL(sqlstr, [email, full_name, gid, fid])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function getUserInfo(userId, callback){
  var sqlstr = `CALL getUserInfo(?);`;
  util.executeSQL(sqlstr, [userId])
  .then(function(allRows) {
    if(util.BETTERjson && allRows.length > 0) allRows = util.doBetterJson([ 'id', 'email', 'full_name', 'role_type_id', 'is_verified', 'optout' ], allRows);
    callback(null, allRows);
  })
  .catch(function(error) {
    callback(error, null);
  })
}

// create email verification token when user sign up
function createEmailVerificationToken(email, token, user_id, callback) {
  var sqlstr = `CALL insert_into_email_verify_table(?,?,?);`;

  util
    .executeSQL(sqlstr, [email, token, user_id])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

// mark user is verified after email verification
function updateUserAsVerified(email, token, callback) {
  var sqlstr = `CALL update_user_as_verified(?,?);`;
  util
    .executeSQL(sqlstr, [email, token])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function findUserById(id, callback) {
  const sqlstr = `CALL find_user_by_id(?);`;
  util
    .executeSQL(sqlstr, [id])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

function updateUser(id, full_name, password, callback) {
  const sqlstr = `CALL update_user(?,?,?);`;
  util
    .executeSQL(sqlstr, [id, full_name, password])
    .then(function(allRows) {
      if (util.BETTERjson && allRows.length > 0)
        allRows = util.doBetterJson(["result"], allRows);
      callback(null, allRows);
    })
    .catch(function(error) {
      callback(error, null);
    });
}

const dbUsers = {
  login: login,
  loginWithSocialId: loginWithSocialId,
  signup: signup,
  signupSocial: signupSocial,
  getUserInfo:getUserInfo,
  createEmailVerificationToken: createEmailVerificationToken,
  updateUserAsVerified: updateUserAsVerified,
  findUserById: findUserById,
  updateUser: updateUser
};

module.exports = dbUsers;
