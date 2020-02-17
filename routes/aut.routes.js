const express = require('express');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const mongoose = require('mongoose');
const saltRounds = 10;

const User = require('../models/User.model')
const routeGuard = require('../configs/route-guard.config')

router.get('/signup', (req, res, next) => {
  res.render('aut/signup')
})