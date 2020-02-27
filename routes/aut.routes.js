const express = require('express');
const router = express.Router();
const bcryptjs = require('bcrypt');
const mongoose = require('mongoose');
const saltRounds = 10;

const User = require('../models/User.model')
const routeGuard = require('../configs/route-guard.config')

router.get('/signup', (req, res) => res.render('authorization/signup'));

router.post('/signup', (req, res, next) => {
  const {
    username,
    email,
    password
  } = req.body;


  // console.log(`This is our input ================== ${req.body}`)

  if (!username || !email || !password) {
    res.render('authorization/signup', {
      errorMessage: 'All fields are mandatory. Please provide your username, email and password.'
    });
    return;
  }

  // const regex = /(?=.*\d)(?=.*[a-z])(?=.-login*[A-Z]).{6,}/;
  // if (!regex.test(password)) {
  //   res
  //     .status(500)
  //     .render('authorization/signup', { errorMessage: 'Password needs to have at least 6 chars and must contain at least one number, one lowercase and one uppercase letter.' });
  //   return;
  // }
  User.findOne({
      username,
    })
    .then(user => {
      if (user !== null) {
        res.render("auth-views/signup", {
          errorMessage: "The username already exists!"

        });
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
            .then(user => res.render('authorization/login', {
              user
            }))
            .catch(err => {
              if (err instanceof mongoose.Error.ValidationError) {
                // console.log(`err: ====> `, err);
                res.status(500).render('authorization/signup', {
                  errorMessage: err.message
                });
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
    .catch(err => next(err));
})

router.get('/login', (req, res) => res.render('authorization/login'));

router.post('/login', (req, res) => {
  const userName = req.body.email
  const userPassword = req.body.password

  if (userName === " " || userPassword === " ") {
    res.render('authorization/login', {
      errorMessage: 'Please enter both, username and password to sign up.'
    })
    return
  }

  User.findOne({
    username: userName
  })
  .then(user => {
    if (!user) {
      res.render('authorization/login', {
        errorMessage: "The username doesn't exist"
      });
      return
    }
    if (bcryptjs.compareSync(userPassword, user.passwordHash)) {
      req.session.user = user
      res.redirect('/')
    } else {
      res.render('authorization/login', {
        errorMessage: "Incorrect password."
      });
    }
  })
  .catch(error => next(error))
});
  

module.exports = router;