// First, require the dot env to connect our mongo DB
require('dotenv').config();

// Next, almost always start with express, cors, and mongoose
const express = require('express');
const app = express();
const path = require('path');
const cors = require('cors');
const mongoose = require('mongoose');

// Next, add our app.use. We will use cors, express.json to pars JSON request bodies. App.use is a method provided by express to add middleware functions, which have access to the request and response objects. 
app.use(cors());
app.use(express.json());

// Next, define our connection and connect to MongoDB via Mongoose.
const connectDB = require('./config/dbConnect');
connectDB();

// Next, define our models here
const UserPost = require('./models/UserPost');

const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
    api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET
});

// Now, include our requests here
app.get('/api', async (req, res) => {
    try {
        const userPosts = await UserPost.find();

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(userPosts);
    } catch (error) {
        console.error('Error: ', error);
        res.statusCode = 500;
        res.json({ message: 'Internal server error' });
    }
});

app.post('/api', async (req, res) => {

    try {
        const { title } = req.body;
        const existingPost = await UserPost.findOne({ title });

        if (existingPost) {
            console.log(req.body);
            res.json({ error: 'title already exists' });
        } else {
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            const userPostData = {
                "userId": req.body.userId,
                "author": req.body.author,
                "title": req.body.title,
                "subTitle": req.body.subTitle,
                "submissionTime": formattedTime,
                "date": formattedDate,
                "publicId": req.body.publicId,
                "img": req.body.img, // access the path of the uploaded file
                "paragraph": req.body.paragraph
            };

            const userPost = await UserPost.create(userPostData);
            console.log(req.body);
            res.json({ "message": "Form Submitted" })
        }
    } catch (error) {
        // Check if a required entry is not filled out.
        if (error instanceof mongoose.Error.ValidationError) {
            res.json({
                error: 'incomplete form'
            })
        }
        console.log('Error: ', error);
    }
});

app.get('/api/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const userPost = await UserPost.findById(uniqueId);

        if (userPost) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            console.log('user post: ', userPost)
            res.json(userPost);

        } else {
            res.statusCode = 404;
            res.json({ message: 'User post not found' })
        }
    } catch (error) {
        console.log('Error: ', error);
        res.statusCode = 500;
        res.json({ message: 'Internal server error' });
    }
});

app.put('/api/:uniqueId', async (req, res) => {

    try {
        const uniqueId = req.params.uniqueId;
        const updateData = req.body;

        // Check if any required fields are missing or empty
        if (!updateData.title || !updateData.subTitle || !updateData.author || !updateData.paragraph) {
            return res.json({ error: 'incomplete form' });
        }

        const updatedPost = await UserPost.findByIdAndUpdate(uniqueId, updateData, {
            new: true,
        });

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


app.delete('/api/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;

        // Ideally, I'd like to delete the image from Cloudinary as well. However, this seems to be a bit more complicated and will require more time to figure out.
        const deletedPost = await UserPost.findByIdAndDelete(uniqueId);

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api', async (req, res) => {
    try {
        const userPosts = await UserPost.find();

        const destroyPromises = userPosts.map((objPost) => {
            if (objPost.publicId) {
                return cloudinary.uploader.destroy(objPost.publicId);
            }
        });

        await Promise.all(destroyPromises);
        await UserPost.deleteMany();
        res.json({ message: 'All user information deleted successfully' });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// CLOUDINARY REQUESTS BELOW
app.post('/cloudinary', async (req, res) => {
    try {
        console.log('this part works!')
        res.send('successful');
    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.delete('/cloudinary/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;
    try {
        let publicId;
        const userPost = await UserPost.findById(uniqueId);
        if (userPost && userPost.publicId) {
            publicId = userPost.publicId;
            console.log('public id is: ', publicId);
            await cloudinary.uploader.destroy(publicId);
            console.log('img deleted from cloudinary??!');
            res.json({ message: 'Image deleted from Cloudinary successfully' });
        } else {
            console.log('public id is: ', publicId);
            console.log(userPost);
            console.log('no image needed to be deleted from cloudinary');
            res.json({ message: 'no image needs to be deleted' });
        }

    } catch (error) {
        console.log('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error from cloudinary unique Id endpoint' });
    }
});

// Lastly, let's have our mongoose connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});