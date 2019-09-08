const redis = require('redis');
const client = redis.createClient();

const CACHE_EXPIRATION = 60 * 60 * 24;

client.on('error', function(err) {
  client.isValid = false;
  client.quit();
});

client.on('connect', function(err) {
  client.isValid = true;
});

async function retrieve(key) {
  var promise = new Promise(function(resolve, reject) {

    if(!client.isValid) reject(new Error('Not connected'));

    client.get(key, (err, result) => {
      if(err) reject(err);
      else {
        result = JSON.parse(result);
        resolve(result);
      }
    });
  });

  return await promise;
}

function set(key, _data) {
  if(!client.isValid) return false;

  client.set(key, JSON.stringify(_data), 'EX', CACHE_EXPIRATION);

  return true;
}

exports.retrieve = retrieve;
exports.set = set;
