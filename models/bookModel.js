const mongoose = require('mongoose');
const bookSchema = new mongoose.Schema({
    title: {
        type: String
    },
    filePath: {
        type: String
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
        type: String
    },
})
module.exports=mongoose.model('bookShelf',bookSchema);