const express = require('express');
const cookieParser = require('cookie-parser');
const app = express();
const cors = require('cors');
const interviewRouter = require('./routes/interview.routes');
const path = require('path');

app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://airesume-ssbu.onrender.com"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
/*require all the routes here*/
const authRouter = require('./routes/auth.routes');

/* using all the routes here*/
app.use('/api/auth', authRouter);
app.use('/api/interview', interviewRouter);
app.use(express.static("./public"));


app.use("*name", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "/public/index.html"));
})

module.exports = app;