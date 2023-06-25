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

// Here, we will define miscellaneous things. For one, we will use multer which allows us to handle file uploads and store them on the server.
const multer = require('multer');

// Multer provides a method called disk storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        // Name of file on server will be the same name as the file on the client side. Otherwise, Multer will give the file a random name.
        let ext = path.extname(file.originalname);
        cb(null, Date.now() + file.originalname);
    }
});

const imageFileFilter = (req, file, cb) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
        return cb(new Error('You can upload only image files!'), false);
    }
    // The callback will take an error (null), and a Boolean to see if the file can be stored.
    cb(null, true);
};

const upload = multer({ storage: storage, fileFilter: imageFileFilter });

// express.static() is a built in middleware function that serves static files. It takes a directory path as an argument and returns a middleware function that serves static files from that directory.
// express.static('uploads') is a middleware function that serves static files from the 'uploads' directory. 
// Serve static files from the "uploads" directory
// app.use('uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static('uploads'));

// Now, include our requests here
app.get('/api', async (req, res) => {
    try {
        const userPosts = await UserPost.find();
        // const userPostsModified = userPosts.map(post => {
        //     const modifiedPost = { ...post._doc }; // Create a clone of the document data

        //     // Check if an image is uploaded or selected for the post
        //     if (modifiedPost.img) {
        //         if (modifiedPost.img.startsWith('uploads')) {
        //             // Image uploaded via file upload
        //             modifiedPost.imgUrl = `${req.protocol}://${req.get('host')}/${modifiedPost.img}`;
        //             console.log(modifiedPost.img);
        //         } else {
        //             // Image selected from browser
        //             modifiedPost.imgUrl = modifiedPost.img;
        //             console.log('here instead?');
        //         }
        //     }

        //     return modifiedPost;
        // });

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(userPostsModified);
    } catch (error) {
        console.error('Error: ', error);
        res.statusCode = 500;
        res.json({ message: 'Internal server error' });
    }
});

app.post('/api', upload.single('img'), async (req, res) => {
    try {
        const { title } = req.body;
        const existingPost = await UserPost.findOne({ title });

        if (existingPost) {
            res.json({ error: 'title already exists' });
        } else {
            let imgPath = '';
            if (req.file) {
                imgPath = req.file.path;
            } else if (req.body.img) {
                // Use the image URL from the form data if an image was selected from the browser
                imgPath = req.body.img;
            }

            const userPostData = {
                "userId": req.body.userId,
                "author": req.body.author,
                "title": req.body.title,
                "subTitle": req.body.subTitle,
                "submissionTime": req.body.submissionTime,
                "date": req.body.date,
                "img": imgPath, // access the path of the uploaded file
                "paragraph": req.body.paragraph
            };
            const userPost = await UserPost.create(userPostData);
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

app.get('/api/:uniqueId', async (req, res) => {
    try {
        const uniqueId = req.params.uniqueId;
        const userPost = await UserPost.findById(uniqueId);

        if (userPost) {
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');

            // Construct the image URL based on the image path. This is needed to show the backend image path onto the frontend.
            if (userPost.img) {
                if (userPost.img.startsWith('uploads/')) {
                    userPost.imgUrl = `https://boardgames-api-attempt2.onrender.com/${userPost.img}`;
                } else {
                    userPost.imgUrl = userPost.img;
                }
            }

            // Include the image URL into the response now.
            const responseData = {
                ...userPost.toObject(),
                imgUrl: userPost.imgUrl
            }

            res.json(responseData);
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

const port = process.env.PORT || 5000;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});