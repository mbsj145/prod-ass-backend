'use strict';
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const Project = require('../projects/project.model');
const Task = require('../tasks/tasks.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');

/**Create Project*/
exports.createProject = async (req, res) => {
  try {
    const {name,description} = req["body"];
    const {userId} = req["user"];

    const schema = Joi.object({
      name: Joi.string().required(),
      description: Joi.string().required(),
    });

    const { error } = schema.validate({name, description});
    if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

    const project = new Project({ ...req.body, owner: userId });
    await project.save();
    return sendResponse(res, SUCCESS, "Project created successfully!", project);

  } catch (error) {
    errReturned(res, error);
  }
}

/**Get all projects*/
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
   return sendResponse(res, SUCCESS, "Get all projects successfully!", projects);
  
  } catch (error) {
    errReturned(res, error);
  }
}

/**Update Project*/
exports.updateProject = async (req, res) => {
    try {
        const {id} = req["params"];
        const {name, description} = req["body"];

        const project = await Project.findById(id);
        if(!project)
            return sendResponse(res, BADREQUEST, "Project not found!");

        const schema = Joi.object({
          name: Joi.string().required(),
          description: Joi.string().required(),
        });
    
        const { error } = schema.validate({name,description});
    
        if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

        project.name = name;
        project.description = description;
        const updatedProject = await project.save();
        return sendResponse(res, SUCCESS, "Project updated successfully!", updatedProject);

    } catch (error) {
      errReturned(res, error);
    }
}

/**Delete project*/
exports.deleteProject = async (req, res) => {
    try {
        const {id} = req["params"];
        const project = await Project.findById(id);
        if (!project) return sendResponse(res, BADREQUEST, "Project not found!");
    
        const removed = await Project.findByIdAndDelete(id);
        await Task.deleteMany({project:id})
        if(removed)
            return sendResponse(res, SUCCESS, "Project deleted successfully!", removed);
        else
            return sendResponse(res, BADREQUEST, "Project not deleted!");

    } catch (error) {
      errReturned(res, error);
    }
}