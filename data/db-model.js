const db = require('./db-config.js');

module.exports = {
  findUsers,
  findBy
}

function findUsers() {
  return db('users');
};

function findBy(userData) {
  return db('users').insert(userData);
}
