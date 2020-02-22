const express = require('express');
const db = require('./data/db-model.js');
const bcrypt = require('bcryptjs');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
  res.send(`It's working`);
});

server.post('/api/register', async (req, res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 10); // hash password
  try {
    const inserted = await db.add(user);
    res.status(201).json(inserted);
  }
  catch (err) {
    res.status(500).json({ message: 'Choose a different username or password', err })
  }
});

server.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await db.findBy({ username });
    if (user && bcrypt.compareSync(password, user.password)) { // real password first then db password
      res.status(200).json({ message: `Welcome ${user.username}` })
    } else {
      res.status(401).json({ message: `Incorrect username or password` })
    }
  }
  catch (err) {
    res.status(500).json({ message: 'Invalid username or password', err })
  }
});

server.get('/api/users', restricted, async (req, res) => {
  try {
    const users = await db.findUsers();
    res.status(200).json(users);
  }
  catch (err) {
    res.status(500).json({ message: 'Invalid username or password' })
  }
});

async function restricted(req, res, next) {
  const { username, password } = req.headers;
  try {
    if (username && password) {
      const user = await db.findBy({ username })
      if (user && bcrypt.compareSync(password, user.password)) {
        next();
      } else {
        res.status(401).json({ message: 'Invalid credentials' })
      }
    } else {
      res.status(400).json({ message: 'Must have valid username / password' })
    }
  }
  catch (err) {
    res.status(500).json({ message: 'Unexpected error' })
  }
}

module.exports = server;