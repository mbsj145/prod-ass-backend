'use strict';

const fs = require("fs");
const jwt = require('jsonwebtoken');
const expressJwt = require('express-jwt');
const compose = require('composable-middleware');

const User = require('../api/user/user.model');
const config = require('../config/environment');
const responseCode = require('../config/resCodes');
// const Logging = require('../api/logging/logging.model');
const { sendResponse, errReturned } = require('../config/dto');
const validateJwt = expressJwt({ secret: process.env.SECRETS });

/**
  * Attaches the user object to the request if authenticated
  * Otherwise returns 403
**/
function isAuthenticated() {
  return compose().use((req, res, next) => {
    if (!req.headers.hasOwnProperty('authorization'))
      return sendResponse(res, responseCode['UNAUTHORIZED'], 'Please login to perform this action');

    if (req.query && req.query.hasOwnProperty('access_token'))
      req.headers.authorization = `Bearer ${req.query.access_token}`;

    validateJwt(req, res, (error, decoded) => {
      if (error) return sendResponse(res, responseCode['UNAUTHORIZED'], `Your session has expired`);
      next(decoded);
    })
  })
}
/**
  * Attaches the user object to the request if hash is valid
**/
function decodeHash() {
  return compose().use(async (req, res, next) => {
    try {
      let hash = req['params'] && req['params'].hasOwnProperty('hash') ? req['params']['hash']
        : req['body'] && req['body']['hash'] ? req['body']['hash']
          : req['headers'].hasOwnProperty('hash') ? req['headers']['hash'] : '';

      if (!hash || hash === '' || hash === undefined || hash === null)
        return sendResponse(res, responseCode['BADREQUEST'], 'Please provide hash');

      let stringVersion = new Buffer(hash, 'base64').toString();
      let _id = stringVersion.split('_')[1];
      let pass = stringVersion.split('_')[0];
      if (pass !== config['encPass']) return sendResponse(res, responseCode['BADREQUEST'], 'Please provide valid hash');

      let user = await User.findById(_id);
      if (!user) return sendResponse(res, responseCode['BADREQUEST'], 'User not found');

      req['user'] = user;
      next();
    } catch (e) { errReturned(res, e) }
  });
}
/**
  * Checks if the user role meets the minimum requirements of the route
*/
function hasRole(roleRequired) {
  if (!roleRequired) throw new Error('Required role needs to be set');

  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (req['user']['role'] === roleRequired)
        next();
      else return sendResponse(res, 403, `You must have ${roleRequired} role perform this action.`);
    });
}
/**
  * Checks if the user account meets the minimum requirements of the route
*/
function hasAccount(accountType) {
  if (!accountType) throw new Error('Required type needs to be set');

  return compose()
    .use(function meetsRequirements(req, res, next) {
      if (req['user']['account'] === accountType)
        next();
      else return sendResponse(res, 403, `Account type must be ${accountType}`);
    });
}
/**
  * Checks if the user role meets the minimum requirements of the route
*/
function isCountry(country) {
  if (!country) throw new Error('Required role needs to be set');

  return compose()
    .use(function meetsRequirements(req, res, next) {
      let {user} = req;
      if (user['citizenship']['short'] === country)
        next();
      else return sendResponse(res, 403, 'You must be US Citizen to access this');
    });
}
/**
  * Checks if the user role meets the minimum requirements of the route
*/
function isVerified() {
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      let { user } = req;
      if (user['role'] !== 'user')
        return sendResponse(res, 403, 'Forbidden');
      if (user['isKycVerified'] !== 'Verified')
        return sendResponse(res, 403, 'Please verifiy KYC before this');
      if (user['isAccredited'] !== 'Verified')
        return sendResponse(res, 403, 'Please verifiy Accredation before this');

      next();
    });
}
/**
  * Checks if the role of user from any admin
*/
function anyAdmin() {
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (config['adminRoles'].indexOf(req['user']['role']) >= 0)
        next();
      else return sendResponse(res, 403, 'Forbidden');
    });
}
/**
  * Checks if the user role meets the minimum requirements of the route
*/
function hasStage(stageRequired) {
  if (!stageRequired) throw new Error('Required stage needs to be set');

  return compose()
    .use(decodeHash())
    .use((req, res, next) => {
      if (!config['userStages'].includes(stageRequired))
        throw new Error('Invalid stage type');
      if (req['user']['stage'] === stageRequired) next();
      else return sendResponse(res, 403, 'Forbidden');
    });
}

/**
  * Returns a jwt token signed by the app secret
*/
function signToken(_id) {
  return jwt.sign({ _id: _id }, config.secrets.session, { expiresIn: 60 * 60 * 5 });
}

/**
  * Set token cookie directly for oAuth strategies
*/
function setTokenCookie(req, res) {
  if (!req.user)
    return sendResponse(res, responseCode.NOTFOUND, 'Something went wrong, please try again.');
  let token = signToken(req.user._id, req.user.role);
  res.cookie('token', JSON.stringify(token));
  res.redirect('/');
}

/**
  * function for checking kyc status of user
*/
function isKycVerified() {
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (req.user.is_kyc_verified == 'Verified')
        next();
      else {
        if (req.user.is_kyc_verified == 'In Complete')
          return sendResponse(res, responseCode.BADREQUEST, 'Please submit kyc details. Only KYC verified users are allowed to perform this action.');
        else if (req.user.is_kyc_verified == 'Pending')
          return sendResponse(res, responseCode.BADREQUEST, 'Please update kyc details or Please allow us sometime to get your kyc verified by admin');
        else return sendResponse(res, responseCode.BADREQUEST, 'Only KYC verified users are allowed to perform this action.');
      }
    });
}
/**
  * function for checking kyc status of user
*/
function verifySms() {
  return compose()
    .use(async function meetsRequirements(req, res, next) {
      let { user } = req;
      let { smsVerifyKey } = req['body'];

      if (!smsVerifyKey)
        return errReturned(res, 'Please verify your number!');
        // return errReturned(res, 'Please provide smsVerifyKey');
      if (user['smsVerifyKey'] != smsVerifyKey)
        return errReturned(res, 'Invalid SMS Code');

      let userUpdated = await User.updateOne({ smsVerifyKey }, { $unset: { smsVerifyKey: true } });
      if (!userUpdated['nModified']) return errReturned(res, 'Invalid sms code');
      else next();
    });
}

//check if pin is valid or not
function verifyPin() {
  return compose()
    .use(isAuthenticated())
    .use(function meetsRequirements(req, res, next) {
      if (!req.body.auth_pin)
        return sendResponse(res, responseCode.BADREQUEST, 'Please provide PIN to proceed');
      else if (!req.user.auth_pin)
        return sendResponse(res, responseCode.BADREQUEST, 'Please setup authentication PIN to proceed');
      else if (req.body.auth_pin && (req.user.auth_pin == req.body.auth_pin))
        next();
      else return sendResponse(res, responseCode.BADREQUEST, 'Please provide valid PIN to proceed');
    });
}

exports.hasRole = hasRole;
exports.anyAdmin = anyAdmin;
exports.hasStage = hasStage;
exports.isCountry = isCountry;
exports.verifySms = verifySms;
exports.verifyPin = verifyPin;
exports.signToken = signToken;
exports.hasAccount = hasAccount;
exports.decodeHash = decodeHash;
exports.isVerified = isVerified;
exports.isKycVerified = isKycVerified;
exports.setTokenCookie = setTokenCookie;
exports.isAuthenticated = isAuthenticated;