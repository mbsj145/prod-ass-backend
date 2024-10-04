'use strict';

const express = require('express');
const controller = require('./user.controller');
const auth = require('../../auth/auth.service');


const router = express.Router();

/**************************  Login & Register  ************************ */
router.post('/register', auth.isAuthenticated(), auth.hasRole("admin"), controller.userRegister);
router.post('/loginUser', controller.userLogin);
router.post('/loginAdmin', controller.adminLogin);


module.exports = router;