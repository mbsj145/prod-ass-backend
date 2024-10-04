'use strict';

const express = require('express');
const controller = require('./project.controller');
const auth = require('../../auth/auth.service');


const router = express.Router();

/**************************  Project  ************************ */
router.get('/project', controller.getProjects);
router.post('/project',auth.isAuthenticated(), auth.hasRole("user"), controller.createProject);
router.put('/project/:id',auth.isAuthenticated(), auth.hasRole("user"), controller.updateProject);
router.delete('/project/:id',auth.isAuthenticated(), auth.hasRole("user"), controller.deleteProject);


module.exports = router;