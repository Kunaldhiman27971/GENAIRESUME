const jwt = require('jsonwebtoken');
const blackListModel = require('../models/blacklist.model')

async function authUser(req, res, next) {
    try {
        const token = req.cookies?.token

        if (!token) {
            return res.status(401).json({
                message: "Token not provided"
            })
        }
        const isTokenBlackListed = await blackListModel.findOne({ token });

        if (isTokenBlackListed) {
            return res.status(401).json({
                message: "Token is invalid"
            })
        }

        if (!process.env.JWT_SECRET) {
            return res.status(500).json({
                message: "JWT secret is not configured"
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = decoded
        return next();
    } catch (err) {
        return res.status(401).json({
            message: "Invalid token"
        })
    }
}

module.exports = {
    authUser
};