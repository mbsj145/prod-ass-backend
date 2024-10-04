'use strict';

const express = require('express');
const controller = require('./tasks.controller');
const auth = require('../../auth/auth.service');


const router = express.Router();

/**************************  Post  ************************ */
router.get('/task/:projectId', controller.getTasks);
router.post('/task',auth.isAuthenticated(), auth.hasRole("user"), controller.createTask);
router.put('/task/:id',auth.isAuthenticated(), auth.hasRole("user"), controller.updateTasks);
router.delete('/task/:id',auth.isAuthenticated(), auth.hasRole("user"), controller.deleteTasks);


module.exports = router;