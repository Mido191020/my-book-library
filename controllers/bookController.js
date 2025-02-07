const multer = require('multer')
const path = require('path');
const bookShelf = require('../models/bookModel')
const fs = require('fs')
const moment = require('moment');
const { count, error } = require('console');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
}
const storage=multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,uploadDir)
    },
    filename:function(req,file,cb){
        
        const cleanFileName = file.originalname.split(' ').join('_').toLowerCase();

        const randomId = Math.random().toString(36).substring(2, 8);
       
        const uniqueName = `${cleanFileName}`;
     
        cb(null, uniqueName);
    }
})

const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
}

exports.upload = multer({
    storage: storage,
    fileFilter: fileFilter
})

exports.uploadBook=async(req,res)=>{
    try{
    if(!req.file){
        return res.status(400).json({ message: 'No file uploaded' });
    }
    const bookData = {
        title: req.body.title.toLowerCase(),
        author: req.body.author.toLowerCase(),
        category: req.body.category.toLowerCase(),
        fileName: req.file.filename,
        filePath: req.file.path,
        uploadDate: moment().format('YYYY-MM-DD')
    };
    const newBook=await bookShelf.create(bookData);
    res.status(201).json({
        message: 'Book uploaded successfully',
            book: newBook
    })
    }catch(error){
        res.status(500).json({
            message: 'Error uploading book',
            error: error.message
        });
    }
}

exports.displayBooks=async(req,res)=>{
    try{
        const getAllBooks=await bookShelf.find({});
        res.status(200).json({
            message:"Books retrieved successfully",
            count:getAllBooks.length,
            data:getAllBooks
        });
    }catch(err){
        res.status(500).json({
        success:false,
        message: 'Error fetching books',
        error: err.message
        })
    }
}

// Specific title search
exports.findBookTitle = async(req, res) => {
    try {
        const { title } = req.body;
        
        if (!title) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a title'
            });
        }

        // Convert search term to lowercase
        const searchTitle = title.toLowerCase();
        const result = await bookShelf.findOne({ title: searchTitle });

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        return res.status(200).json({
            success: true,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error finding book",
            error: err.message
        });
    }
}

// Author search
exports.findBookAuthor = async(req, res) => {
    try {
        const { author } = req.body;
        
        if (!author) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an author name'
            });
        }

        // Convert search term to lowercase
        const searchAuthor = author.toLowerCase();
        const result = await bookShelf.find({ author: searchAuthor });

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No books found for this author'
            });
        }

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error finding author's books",
            error: err.message
        });
    }
}

// Category search
exports.findBookCategory = async(req, res) => {
    try {
        const { category } = req.body;
        
        if (!category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a category'
            });
        }

        // Convert search term to lowercase
        const searchCategory = category.toLowerCase();
        const result = await bookShelf.find({ category: searchCategory });

        if (!result || result.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No books found in this category'
            });
        }

        return res.status(200).json({
            success: true,
            count: result.length,
            data: result
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Error finding books in category",
            error: err.message
        });
    }
}

// Combined search
exports.search = async(req, res) => {
    try {
        const { title, author, category } = req.body;
        
        if (!title && !author && !category) {
            return res.status(400).json({
                success: false,
                message: 'Please provide at least one search parameter (title, author, or category)'
            });
        }

        // Build search query with lowercase values
        const searchQuery = {};
        if (title) searchQuery.title = title.toLowerCase();
        if (author) searchQuery.author = author.toLowerCase();
        if (category) searchQuery.category = category.toLowerCase();

        const results = await bookShelf.find(searchQuery);

        if (!results || results.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'No books found matching your search criteria'
            });
        }

        return res.status(200).json({
            success: true,
            count: results.length,
            data: results
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error while searching books',
            error: error.message
        });
    }
}
exports.getId=async(req,res)=>{
    try{ const bookId=req.params.id
        const book=await bookShelf.findOne({id:bookId})
        if(!book){
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book)

    }catch(err){
        res.status(500).json({ message: 'Error fetching book', error: error.message });
        }
}

exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        
        // Find the book first to get file information
        const book = await bookShelf.findById(bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete the physical file
        if (book.filePath) {
            fs.unlink(book.filePath, (err) => {
                if (err) {
                    console.error('Error deleting file:', err);
                }
            });
        }

        // Delete the book from database
        await bookShelf.findByIdAndDelete(bookId);

        return res.status(200).json({
            success: true,
            message: 'Book deleted successfully'
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: 'Error deleting book',
            error: error.message
        });
    }
};

