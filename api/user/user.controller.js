'use strict';
const jwt = require('jsonwebtoken');
const Joi = require('joi');
const User = require('../user/user.model');
const { SUCCESS, BADREQUEST } = require('../../config/resCodes');
const { sendResponse, errReturned } = require('../../config/dto');


/**User Registration*/
exports.userRegister = async (req, res) => {
  try {
    const {email, password} = req["body"];

    const schema = Joi.object({
      email:Joi.string().email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
      password: Joi.string().min(6).required(),
    });

    const { error } = schema.validate(req["body"]);
    if (error) return sendResponse(res, BADREQUEST, error.details[0].message);

    const findUser  = await User.findOne({email})
    if(findUser)
      return sendResponse(res, BADREQUEST, "Your email already register");

    const user = new User({email, password });
    await user.save();

    return sendResponse(res, SUCCESS, "User register successfully!", user);

  } catch (error) {
    errReturned(res, error);
  }
}

/**User Login*/
exports.userLogin = async (req, res) => {
  try {
  
    const { email, password } = req["body"];
    const user = await User.findOne({$and:[{ email }, {role:"user"}]});    
    if (!user || !(await user.comparePassword(password)))
        return sendResponse(res, BADREQUEST, 'Invalid credentials')
  
   const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRETS, { expiresIn: '1h' });
   return sendResponse(res, SUCCESS, "User login successfully!", {token});
  
  } catch (error) {
    errReturned(res, error);
  }
}

/**Admin Login*/
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req["body"];
    const user = await User.findOne({$and:[{ email }, {role:"admin"}]});
    if (!user || !(await user.comparePassword(password))) 
        return sendResponse(res, BADREQUEST, 'Invalid credentials')
  
   const token = jwt.sign({ userId: user._id, role: user.role }, process.env.SECRETS, { expiresIn: '1h' });
   return sendResponse(res, SUCCESS, "User login successfully!", {token});
  
  } catch (error) {
    errReturned(res, error);
  }
}