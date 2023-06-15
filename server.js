// First, require the dot env to connect our mongo DB
require('dotenv').config();

// Next, almost always start with express, cors, and mongoose
const express = require('express');
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');

// Next, add our app.use. We will use cors, express.json to pars JSON request bodies
app.use(cors());
app.use(express.json());

// Next, define our connection and connect to MongoDB via Mongoose.
const connectDB = require('./config/dbConnect');
connectDB();

// Next, define our models here
const UserPost = require('./models/UserPost');

// Now, include our requests here
app.get('/api', (req, res) => {
    UserPost.find()
        .then(users => {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(users);
        })
        .catch(err => console.error('Error: ', err));
});

app.post('/api', async (req, res) => {
    try {
        const { title } = req.body;
        const existingPost = await UserPost.findOne({ title });

        if (existingPost) {
            res.json({ error: 'title already exists' });
        } else {
            const userPost = await UserPost.create({
                "userId": req.body.userId,
                "author": req.body.author,
                "title": req.body.title,
                "subTitle": req.body.subTitle,
                "submissionTime": req.body.submissionTime,
                "date": req.body.date,
                "img": req.body.img,
                "paragraph": req.body.paragraph
            });
            res.json({ "message": "Form Submitted" })
        }
    } catch (error) {
        // Check if a required entry is not filled out.
        if (error instanceof mongoose.Error.ValidationError) {
            res.json({ error: 'incomplete form' })
        }
        console.log('Error: ', error);
    }
});

app.put('/api/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const updateData = req.body;

        const updatedPost = await UserPost.findByIdAndUpdate(uniqueId, updateData, {
            new: true,
        });

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Check if any required fields are missing or empty
        if (!updateData.title || !updateData.subTitle || !updateData.author || !updateData.paragraph) {
            console.log('bad bad');
            return res.status(200).json({ error: 'incomplete form' });
        }

        // Check if no changes were made
        // const changedFields = Object.keys(updateData).filter(key => updatedPost[key] !== updateData[key]);
        // if (changedFields.length === 0) {
        //     return res.status(200).json({ error: 'no changes' });
        // }

        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


app.delete('/api/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const deletedPost = await UserPost.findByIdAndDelete(uniqueId);

        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ error: 'Server error' });
    }
});

app.delete('/api', async (req, res) => {
    try {
        await UserPost.deleteMany();
        res.json({ message: 'All user information deleted successfully' });
    } catch (err) {
        console.log('Error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Lastly, let's have our mongoose connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    // app.listen(5000, () => console.log('Server Started at Port 5000'));
});

app.listen(5000, () => {
    console.log('Server Started at Port 5000');
});