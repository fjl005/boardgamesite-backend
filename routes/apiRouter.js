const UserPost = require('../models/UserPost');
const express = require('express');
const apiRouter = express.Router();

apiRouter.get('/', async (req, res) => {
    try {
        const userPosts = await UserPost.find();
        res.statusCode = 200;
        // Here, we will define the headers and send the response formatted based on the headers. However, for the remainder of the code, the response will always be in JSON format. So, I will be using res.json as a way to not only set the header to application/json, but also send the data in json format.
        res.setHeader('Content-Type', 'application/json');
        res.send(JSON.stringify(userPosts));
    } catch (error) {
        console.error('Error: ', error);
        res.statusCode = 500;
        res.send(JSON.stringify({ message: 'Internal server error' }));
    }
});

apiRouter.post('/', async (req, res) => {
    const errors = {
        existingTitle: 'title already exists',
        incompleteForm: 'incomplete form',
    }

    try {
        const { reqBody } = req.body;
        const { title, subTitle, author, paragraph } = reqBody;
        const existingPost = await UserPost.findOne({ title });

        if (existingPost) {
            throw new Error(errors.existingTitle);
        } else if (!title || !subTitle || !author || !paragraph) {
            throw new Error(errors.incompleteForm);
        } else {
            const currentDate = new Date();
            const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

            const userPostData = {
                "userId": reqBody.userId,
                "author": reqBody.author,
                "title": reqBody.title,
                "subTitle": reqBody.subTitle,
                "submissionTime": formattedTime,
                "date": formattedDate,
                "publicId": reqBody.publicId,
                "img": reqBody.img,
                "paragraph": reqBody.paragraph
            };

            const userPost = await UserPost.create(userPostData);
            res.statusCode = 200;
            res.json({ "message": "Form Submitted" });
        }
    } catch (error) {
        console.error('error message: ', error.message);
        if (error.message) {
            return res.status(400).json({ error: error.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

apiRouter.delete('/', async (req, res) => {
    try {
        const userPosts = await UserPost.find();

        if (!userPosts) {
            return res.status(404).json({ error: "Posts not found" });
        }

        const destroyPromises = userPosts.map((objPost) => {
            if (objPost.publicId) {
                return cloudinary.uploader.destroy(objPost.publicId);
            }
        });

        await Promise.all(destroyPromises);

        await UserPost.deleteMany();
        res.statusCode = 200;
        res.json({ message: 'All user information deleted successfully' });
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


apiRouter.get('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const userPost = await UserPost.findById(postId);
        if (userPost) {
            res.statusCode = 200;
            res.json(userPost);
        } else {
            res.statusCode = 404;
            res.json({ message: 'User post not found' })
        }
    } catch (error) {
        console.error('Error: ', error);
        res.statusCode = 500;
        res.json({ message: 'Internal server error' });
    }
});

apiRouter.put('/:postId', async (req, res) => {

    try {
        const postId = req.params.postId;
        const { reqBody } = req.body;
        const {
            title,
            subTitle,
            author,
            paragraph
        } = reqBody;

        if (!title || !subTitle || !author || !paragraph) {
            return res.status(400).json({ error: 'incomplete form' });
        }

        const updatedPost = await UserPost.findByIdAndUpdate(postId, reqBody, {
            new: true,
        });

        if (!updatedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.statusCode = 200;
        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Server error' });
    }
});


apiRouter.delete('/:postId', async (req, res) => {
    try {
        const postId = req.params.postId;
        const deletedPost = await UserPost.findByIdAndDelete(postId);
        if (!deletedPost) {
            return res.status(404).json({ error: 'Post not found' });
        }

        res.statusCode = 200;
        res.json({ message: 'Post deleted successfully' });
    } catch (err) {
        console.error('Error: ', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = apiRouter;