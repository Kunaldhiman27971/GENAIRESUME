const userModel = require('../models/user.model');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const blackListModel = require('../models/blacklist.model');


/**
 * @name registerUserController
 * @description Register a new user , checks if the user already exists, if not creates a new user and saves it to the database
 * @access Public
 */
async function registerUserController(req, res) {
    try {
        const { username, email, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                message: "Please provide username, email and password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        const isUserExist = await userModel.findOne({
            $or: [{ username }, { email }]
        });

        if (isUserExist) {
            return res.status(400).json({
                message: "User already exists with the provided username or email"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new userModel({
            username,
            email,
            password: hashedPassword
        });

        await newUser.save();

        const token = jwt.sign(
            { id: newUser._id, username: newUser.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true });

        return res.status(201).json({
            message: "User registered successfully",
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to register user",
            error: err.message
        });
    }
}


/**
 * @name loginUserController
 * @description Login a user , checks if the user exists, if yes then compares the password and if it matches then generates a token and sends it to the client
 * @access Public
 */

async function loginUserController(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Please provide email and password"
            });
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            });
        }

        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const ispasswordmatch = await bcrypt.compare(password, user.password);

        if (!ispasswordmatch) {
            return res.status(400).json({
                message: "Invalid credentials"
            });
        }

        const token = jwt.sign(
            { id: user._id, username: user.username },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, { httpOnly: true });

        return res.status(200).json({
            message: "User logged in successfully",
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (err) {
        return res.status(500).json({
            message: "Failed to login user",
            error: err.message
        });
    }
}




/**
 * @name logoutUserController
 * @description Logout a user by blacklisting the token
 * @access Public
 */

async function logoutUserController(req, res) {
    const token=req.cookies.token;
    if(token){
        await blackListModel.create({token});
    }
    res.clearCookie('token')
    res.status(200).json({
        message:"User logged out successfully"
    })
}


/**
 * @name getMeController
 * @description Get the details of the logged in user
 * @access Private
 */

async function getMeController(req, res){
    const user=await userModel.findById(req.user.id)
    res.status(200).json({
        message:"User details fetched successfully",
        user:{
            id: user._id,
            username: user.username,
            email:user.email
        }
    })
}

module.exports = {
    registerUserController,
    loginUserController,
    logoutUserController,
    getMeController
};