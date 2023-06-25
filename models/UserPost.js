// Naming convention: schemas are usually done with a capital letter.

// First, define mongoose, require it. Then define Schema.
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Now, create the Schema as an object.
const userPostSchema = new Schema({
    userId: {
        type: String,
        required: false
    },
    author: {
        type: String,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    subTitle: {
        type: String,
        required: true
    },
    submissionTime: {
        type: Date,
        required: false
    },
    date: {
        type: Date,
        required: false
    },
    img: {
        // store it as a filepath.
        type: String,
        data: Buffer,
        contentType: String,
        required: false
    },
    paragraph: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('UserPost', userPostSchema);