const express = require('express');
const db = require('./data/db-model.js');
const bcrypt = require('bcryptjs');

const server = express();

server.use(express.json());

server.get('/', (req, res) => {
  res.send(`It's working`);
});

server.get('/api/users', async (req, res) => {
  try {
    const users = await db.findUsers();
    res.status(200).json(users);
  }
  catch (err) {
    res.status(500).json({ message: 'Invalid username or password' })
  }
});

server.post('/api/register', async (req, res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 10);
  try {
    const inserted = await db.addUser(user);
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

    if (user && bcrypt.compareSync(password, user.password)) {
      res.status(200).json({ message: `Welcome ${user.username}` })
    } else {
      res.status(401).json({ message: `Incorrect username or password` })
    }
  }
  catch (err) {
    res.status(500).json({ message: 'Invalid username or password', err })
  }
})

module.exports = server;