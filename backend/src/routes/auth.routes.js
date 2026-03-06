const express = require('express');
const authRouter=express.Router();
const authController=require('../controllers/auth contorller');
// jsdoc comment 

/**
 * @route POST /api/auth/register
 * @description Register a new user
 * @access Public
 */

authRouter.post("/register", authController.registerUserController);


/** 
 * @route POST /api/auth/login
 * @description Login a user with email and password
 * @access Public
 */

authRouter.post("/login",authController.loginUserController);
module.exports=authRouter;