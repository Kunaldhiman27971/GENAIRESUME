const express = require('express');
const authRouter=express.Router();
const authController=require('../controllers/auth.contorller');
const authMiddleware=require('../middleware/auth.middleware')
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


/**
 * @route GET /api/auth/logout
 * @description Logout a user by blacklisting the token
 * @access Public
 */


authRouter.get('/logout',authController.logoutUserController);


/**
 * @route GET /api/auth/get-me
 * @description Get the details of the logged in user
 * @access Private
 */

authRouter.get('/get-me', authMiddleware.authUser,authController.getMeController);

module.exports=authRouter;