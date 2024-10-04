'use strict';

var express = require('express');
var passport = require('passport');
var auth = require('../auth.service');
const dto = require('../../config/dto');
const responseCode = require('../../config/resCodes');

var router = express.Router();

router.post('/', function (req, res, next) {
  passport.authenticate('local', function (err, user, info) {
    var error = err || info;
    if (error) return dto.sendResponse(res, responseCode.UNAUTHORIZED, 'Something went wrong, please try again.');
    if (!user) return dto.sendResponse(res, responseCode.UNAUTHORIZED, 'Something went wrong, please try again.');

    var token = auth.signToken(user._id, user.role);
    return dto.sendResponse(res, responseCode.SUCCESS, 'Successfully logged in', { token: token });
  })(req, res, next)
});

module.exports = router;