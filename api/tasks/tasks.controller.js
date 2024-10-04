'use strict';
const Joi = require('joi');
const Task = require('./tasks.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');

/**Create task*/
exports.createTask = async (req, res) => {
  try {
    const {title,description,status, projectId} = req["body"];
    const {userId} = req["user"];

    const schema = Joi.object({
        title: Joi.string().required(),
        description: Joi.string().required(),
    });

    const { error } = schema.validate({title,description});

    if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

    const task = new Task({title,description,status, project:projectId, user: userId });
    await task.save();
    return sendResponse(res, SUCCESS, "Task created successfully!",task);

  } catch (error) {
    errReturned(res, error);
  }
}

/**Get all task by project*/
exports.getTasks = async (req, res) => {
  try {
    const {projectId} = req["params"];
    const tasks = await Task.find({project:projectId}).populate('project')
   return sendResponse(res, SUCCESS, "Get all task by project successfully!", tasks);
  
  } catch (error) {
    errReturned(res, error);
  }
}

/**Update task*/
exports.updateTasks = async (req, res) => {
    try {
        const {id} = req['params'];
        const {title,description,status, projectId} = req["body"];

        const task = await Task.findById(id);
        if(!task)
            return sendResponse(res, BADREQUEST, "Task not found!");

        const schema = Joi.object({
          title: Joi.string().required(),
          description: Joi.string().required(),
        });
  
        const { error } = schema.validate({title,description});
    
        if (error) 
            return sendResponse(res, BADREQUEST, error.details[0].message);

        task.title = title;
        task.description = description;
        task.status = status;
        task.project = projectId;
        const updatedPost = await task.save();
        return sendResponse(res, SUCCESS, "Task updated successfully!", updatedPost);

    } catch (error) {
      errReturned(res, error);
    }
}

/**Delete task*/
exports.deleteTasks = async (req, res) => {
    try {
        const {id} = req["params"];
        const task = await Task.findById(id);
        if (!task) return sendResponse(res, BADREQUEST, "Task not found!");
    
        const removed = await Task.findByIdAndDelete(id);
        if(removed)
            return sendResponse(res, SUCCESS, "task deleted successfully!", removed);
        else
            return sendResponse(res, BADREQUEST, "task not deleted!");

    } catch (error) {
      errReturned(res, error);
    }
}