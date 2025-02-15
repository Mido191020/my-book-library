const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: {
        type: String
    },
    fileId: {
        type: mongoose.Schema.Types.ObjectId // Store GridFS file ID
    },
    fileName: {
        type: String
    },
    uploadedAt: { 
        type: Date, 
        default: Date.now 
    },
    category: {
        type: String
    },
    author: {
        type: String
    },
    isbn: {
        type: String,
        unique: true,
    },
});

module.exports = mongoose.model('bookShelf', bookSchema);