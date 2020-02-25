const express = require('express');
const db = require('./data/db-model.js');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const server = express();

// set up a sessionConfig obj
const sessionConfig = {
  name: 'coding',
  secret: 'lambda school',
  cookie: {
    maxAge: 1000 * 60 * 60,
    secure: false,
    httpOnly: true
  },
  resave: false,
  saveUninitialized: false
}

server.use(express.json());

server.use(session(sessionConfig));

server.get('/', (req, res) => {
  res.send(`It's working`);
});

server.post('/api/register', async (req, res) => {
  const user = req.body;
  user.password = bcrypt.hashSync(user.password, 10); // hash password
  try {
    // create a session and send back cookie are being taken care of by express-session library
    req.session.user = user; // req.session already created, this just add the user info to the session

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

      // create a session and send back cookie are being taken care of by express-session library
      req.session.user = user; // req.session already created, this just add the user info to the session
      res.status(200).json({ message: `Welcome ${user.username} with a cookie` })
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

server.get('/api/logout', (req, res) => {
  if (req.session) {
    req.session.destroy(err => {
      if (err) {
        res.json({ message: 'Something went wrong' })
      } else {
        res.json({ message: 'You have been successfully logged out' })
      }
    })
  }
})

function restricted(req, res, next) {
  // as long as someone has username and password
  // that we already validated
  // they should be able to access
  // can't be using headers, grab cookie instead
  // session must be created and must have user info

  if (req.session && req.session.user) {
    next();
  } else {
    res.status(401).json({ message: 'Invalid credentials' })
  }
}

module.exports = server;