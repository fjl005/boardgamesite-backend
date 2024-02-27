const UserPost = require('../models/UserPost');
const express = require('express');
const cloudinaryRouter = express.Router();
const cloudinary = require('../config/cloudinaryConfig');

cloudinaryRouter.get('/', async (req, res) => {
    try {
        res.statusCode = 200;
        res.send('successful');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

cloudinaryRouter.delete('/:postId', async (req, res) => {
    const postId = req.params.postId;

    try {
        // let publicId;
        const userPost = await UserPost.findById(postId);
        console.log('user post: ', userPost);
        res.statusCode = 200;

        if (userPost && userPost.publicId) {
            // publicId = userPost.publicId;
            console.log('public Id: ', userPost.publicId);

            await cloudinary.uploader.destroy(userPost.publicId);
            return res.json({ message: 'Image deleted from Cloudinary successfully' });
        }

        return res.json({ message: 'no image needs to be deleted' });

    } catch (error) {
        console.log(' --- ');
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error from cloudinary unique Id endpoint' });
    }
});

module.exports = cloudinaryRouter;