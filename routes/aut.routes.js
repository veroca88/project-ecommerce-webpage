const express = require('express');
const router = express.Router();
const bcryptjs = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

const User = require('../models/User.model')
const routeGuard = require('../configs/route-guard.config')

router.get('/signup', (req, res) => res.render('authorization/signup'));

router.post('/signup', (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.render('authorization/signup', { errorMessage: 'All fields are mandatory. Please provide your username, email and password.' });
    return;
  }

  const regex = /(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,}/;
  if (!regex.test(password)) {
    res
      .status(500)
      .render('authorization/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
    return;
  }

  bcryptjs
    .genSalt(saltRounds)
    .then(salt => bcryptjs.hash(password, salt))
    .then(hashedPassword => {
      // console.log(`Password hash: ${hashedPassword}`)
      return User.create({
        // username: username
        username,
        email,
        passwordHash: hashedPassword
      })
        .then(user => res.render('users/user-profile', { user }))
        .catch(err => {
          if (err instanceof mongoose.Error.ValidationError) {
            // console.log(`err: ====> `, err);
            res.status(500).render('authorization/signup', { errorMessage: err.message });
          } else if (err.code === 11000) {
            res.status(500).render('authorization/signup', {
              errorMessage: 'Username and email need to be unique. Either username or email is already used.'
            });
          } else {
            next(err);
          }
        });
    })
    .catch(err => next(err));

})


module.exports = router;