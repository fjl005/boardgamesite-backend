// First, import all necessary modules: .env, express, cors, mongoose.
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');


// Second, introduce middlewares to our Express App (via app.use). (1) CORS, (2) express.JSON (to parse JSON request bodies).
app.use(cors());
app.use(express.json());


// Third, define our connection and connect to MongoDB via Mongoose.
const connectDB = require('./config/dbConnect');
connectDB();


// Fourth, define Cloudinary, and have it configured based on data stored in our .env file.
// const cloudinary = require('cloudinary');

// cloudinary.config({
//     cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
//     api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
//     api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET
// });


// Fifth, define our routes.
const router = express.Router();
const apiRouter = require('./routes/apiRouter');
const cloudinaryRouter = require('./routes/cloudinaryRouter');

app.use('/', router);
router.use('/api', apiRouter);
router.use('/cloudinary', cloudinaryRouter);


// Lastly, let's set up our server once the mongoDB connection is established.
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});

// module.exports = cloudinary;