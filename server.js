// First, import all the requirements: .env, express, cors, mongoose.
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

// Fourth, define our models here. In this case, we only have one for the articles people can post. 
const UserPost = require('./models/UserPost');

// Fifth, define Cloudinary, and have it configured based on data stored in our .env file.
const cloudinary = require('cloudinary');

cloudinary.config({
    cloud_name: process.env.REACT_APP_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.REACT_APP_CLOUDINARY_API_KEY,
    api_secret: process.env.REACT_APP_CLOUDINARY_API_SECRET
});


// Sixth, define our routes.
const router = express.Router();
const apiRouter = require('./routes/apiRouter');
const cloudinaryRouter = require('./routes/cloudinaryRouter');

app.use('/', router);
router.use('/api', apiRouter);
router.use('/cloudinary', cloudinaryRouter);


// Sixth, define our backend requests. Since there aren't a lot of endpoints, we won't use express router. 
// app.get('/api', async (req, res) => {
//     try {
//         const userPosts = await UserPost.find();
//         res.statusCode = 200;
//         // Here, we will define the headers and send the response formatted based on the headers. However, for the remainder of the code, the response will always be in JSON format. So, I will be using res.json as a way to not only set the header to application/json, but also send the data in json format.
//         res.setHeader('Content-Type', 'application/json');
//         res.send(JSON.stringify(userPosts));
//     } catch (error) {
//         console.error('Error: ', error);
//         res.statusCode = 500;
//         res.send(JSON.stringify({ message: 'Internal server error' }));
//     }
// });

// app.post('/api', async (req, res) => {
//     const errors = {
//         existingTitle: 'title already exists',
//         incompleteForm: 'incomplete form',
//     }

//     try {
//         const { reqBody } = req.body;
//         const { title, subTitle, author, paragraph } = reqBody;
//         const existingPost = await UserPost.findOne({ title });

//         if (existingPost) {
//             throw new Error(errors.existingTitle);
//         } else if (!title || !subTitle || !author || !paragraph) {
//             throw new Error(errors.incompleteForm);
//         } else {
//             const currentDate = new Date();
//             const formattedDate = currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
//             const formattedTime = currentDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

//             const userPostData = {
//                 "userId": reqBody.userId,
//                 "author": reqBody.author,
//                 "title": reqBody.title,
//                 "subTitle": reqBody.subTitle,
//                 "submissionTime": formattedTime,
//                 "date": formattedDate,
//                 "publicId": reqBody.publicId,
//                 "img": reqBody.img,
//                 "paragraph": reqBody.paragraph
//             };

//             const userPost = await UserPost.create(userPostData);
//             res.statusCode = 200;
//             res.json({ "message": "Form Submitted" });
//         }
//     } catch (error) {
//         // Check if a required entry is not filled out.
//         console.error('error message: ', error.message);
//         if (error.message) {
//             return res.status(400).json({ error: error.message });
//         }
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// app.get('/api/:postId', async (req, res) => {
//     try {
//         const postId = req.params.postId;
//         const userPost = await UserPost.findById(postId);
//         if (userPost) {
//             res.statusCode = 200;
//             res.json(userPost);
//         } else {
//             res.statusCode = 404;
//             res.json({ message: 'User post not found' })
//         }
//     } catch (error) {
//         console.error('Error: ', error);
//         res.statusCode = 500;
//         res.json({ message: 'Internal server error' });
//     }
// });

// app.put('/api/:postId', async (req, res) => {

//     try {
//         const postId = req.params.postId;
//         const { reqBody } = req.body;
//         const {
//             title,
//             subTitle,
//             author,
//             paragraph
//         } = reqBody;

//         if (!title || !subTitle || !author || !paragraph) {
//             return res.status(400).json({ error: 'incomplete form' });
//         }

//         const updatedPost = await UserPost.findByIdAndUpdate(postId, reqBody, {
//             new: true,
//         });

//         if (!updatedPost) {
//             return res.status(404).json({ error: 'Post not found' });
//         }

//         res.statusCode = 200;
//         res.json(updatedPost);
//     } catch (error) {
//         console.error('Error updating user:', error);
//         res.status(500).json({ error: 'Server error' });
//     }
// });


// app.delete('/api/:postId', async (req, res) => {
//     try {
//         const postId = req.params.postId;
//         const deletedPost = await UserPost.findByIdAndDelete(postId);
//         if (!deletedPost) {
//             return res.status(404).json({ error: 'Post not found' });
//         }

//         res.statusCode = 200;
//         res.json({ message: 'Post deleted successfully' });
//     } catch (err) {
//         console.error('Error: ', err);
//         res.status(500).json({ error: 'Server error' });
//     }
// });

// app.delete('/api', async (req, res) => {
//     try {
//         const userPosts = await UserPost.find();

//         if (!userPosts) {
//             return res.status(404).json({ error: "Posts not found" });
//         }

//         const destroyPromises = userPosts.map((objPost) => {
//             if (objPost.publicId) {
//                 return cloudinary.uploader.destroy(objPost.publicId);
//             }
//         });

//         await Promise.all(destroyPromises);

//         await UserPost.deleteMany();
//         res.statusCode = 200;
//         res.json({ message: 'All user information deleted successfully' });
//     } catch (err) {
//         console.error('Error: ', err);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// // CLOUDINARY REQUESTS BELOW
// app.get('/cloudinary', async (req, res) => {
//     try {
//         res.statusCode = 200;
//         res.send('successful');
//     } catch (error) {
//         console.error('Error: ', error);
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// });

// app.delete('/cloudinary/:uniqueId', async (req, res) => {
//     const uniqueId = req.params.uniqueId;
//     try {
//         let publicId;
//         const userPost = await UserPost.findById(uniqueId);
//         res.statusCode = 200;

//         if (userPost && userPost.publicId) {
//             publicId = userPost.publicId;
//             await cloudinary.uploader.destroy(publicId);
//             return res.json({ message: 'Image deleted from Cloudinary successfully' });
//         }

//         return res.json({ message: 'no image needs to be deleted' });

//     } catch (error) {
//         console.error('Error: ', error);
//         res.status(500).json({ error: 'Internal Server Error from cloudinary unique Id endpoint' });
//     }
// });

// Lastly, let's have our mongoose connection
mongoose.connection.once('open', () => {
    console.log('Connected to MongoDB');
    const port = process.env.PORT || 5000;
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
});