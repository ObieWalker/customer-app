//const mysqlx = require('@mysql/xdevapi');
const mysql = require('mysql');
const options = require('../constants/dbOptions');

/* CHANGE TO mysql BECAUSE THE DB WAS NOT INSTALL X PLUGIN AND WE DONT WANT TO MESSUP WITH THAT */
const pool = mysql.createPool(options);
console.log('DB pool created.');

/* THE BEST WAY FOR A CLEAN CODE */
exports.executeSQL = async function (sqlstr, params) {

  var promise = new Promise(function(resolve, reject) {

    var allRows = [];

    /*
    mysqlx.getSession(options)
    .then(function (session) {
        session.sql(sqlstr).execute(function(row) {
          allRows.push(row);
      })
      .then(function() {
        session.close();
        resolve(allRows);
      })
      .catch(function(err) {
        session.close();
        reject();
      })
    })
    .catch(function(err) {
      reject(err);
    }); */

    pool.getConnection(function(error, mysqlConnection) {
      if(error) {
        console.log(error);
        reject();
        return;
      }

      mysqlConnection.query(sqlstr, params, function(error, allRows) {
        mysqlConnection.release();
        if(error) {
          console.log(error)
          reject();
        }
        else resolve(allRows);
      });

    });
  });

  return await promise;
}

exports.doBetterJson = function (names, allRows) {
  /*
  var objs = [];
  for(var i = 0; i < allRows.length; i++)
  {
    var json = {};
    for(var j = 0; j < names.length; j++)
    {
      var key = names[j];
      json[key] = allRows[i][j];
    }

    objs.push(json);
  }

  return objs; */
  return allRows[0];
}

exports.BETTERjson = true;
