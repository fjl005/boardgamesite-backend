const UserPost = require('../models/UserPost');
const express = require('express');
const cloudinaryRouter = express.Router();

cloudinaryRouter.get('/', async (req, res) => {
    try {
        res.statusCode = 200;
        res.send('successful');
    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

cloudinaryRouter.delete('/:uniqueId', async (req, res) => {
    const uniqueId = req.params.uniqueId;
    try {
        let publicId;
        const userPost = await UserPost.findById(uniqueId);
        res.statusCode = 200;

        if (userPost && userPost.publicId) {
            publicId = userPost.publicId;
            await cloudinary.uploader.destroy(publicId);
            return res.json({ message: 'Image deleted from Cloudinary successfully' });
        }

        return res.json({ message: 'no image needs to be deleted' });

    } catch (error) {
        console.error('Error: ', error);
        res.status(500).json({ error: 'Internal Server Error from cloudinary unique Id endpoint' });
    }
});

module.exports = cloudinaryRouter;