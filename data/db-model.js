const db = require('./db-config.js');

module.exports = {
  findUsers,
  addUser,
  findBy
}

function findUsers() {
  return db('users');
};

function addUser(userData) {
  return db('users')
    .insert(userData)

    .then(arr => {
      return findById(arr[0])
    })
};

function findBy(query) {
  return db('users').where(query).first();
}

function findById(id) {
  return db('users').where({ id }).first();
};
