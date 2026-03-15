const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const interviewRouter = require('./routes/interview.routes');

app.use(cors({
    origin: 'http://localhost:5173', // Replace with your frontend URL
    credentials: true, // Allow cookies to be sent
}));

app.use(express.json());
app.use(cookieParser());
/*require all the routes here*/
const authRouter = require('./routes/auth.routes');

/* using all the routes here*/
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);


module.exports = app;