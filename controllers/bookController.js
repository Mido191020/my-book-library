const multer = require('multer');
const { GridFsStorage } = require('multer-gridfs-storage');
const Grid = require('gridfs-stream');
const mongoose = require('mongoose');
const bookShelf = require('../models/bookModel');
const fs = require('fs');
const moment = require('moment');
const { count, error } = require('console');
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir); // Create uploads directory if it doesn't exist
}

// Create MongoDB connection
const conn = mongoose.createConnection(process.env.DATABASE_URL);

// Initialize GridFS
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection('uploads');
});

// Create storage engine
const storage = new GridFsStorage({
    url: process.env.DATABASE_URL,
    options: { useNewUrlParser: true, useUnifiedTopology: true },
    file: (req, file) => {
        return new Promise((resolve, reject) => {
            const cleanFileName = file.originalname.split(' ').join('_').toLowerCase();
            const uniqueName = `${Date.now()}_${cleanFileName}`;
            
            const fileInfo = {
                filename: uniqueName,
                bucketName: 'uploads',
                metadata: {
                    title: req.body.title,
                    author: req.body.author,
                    category: req.body.category,
                    uploadDate: moment().format('YYYY-MM-DD')
                }
            };
            resolve(fileInfo);
        });
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Only PDF files are allowed!'), false);
    }
};

// Configure upload middleware
exports.upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 30 * 1024 * 1024 } // 30MB limit
}).array('books', 100);

// Upload handler
exports.uploadBook = async(req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        const results = {
            success: 0,
            failed: 0,
            totalFiles: req.files.length,
            successfulUploads: [],
            failedUploads: []
        };

        for (const file of req.files) {
            try {
                const bookData = {
                    title: req.body.title.toLowerCase(),
                    author: req.body.author.toLowerCase(),
                    category: req.body.category.toLowerCase(),
                    fileName: file.filename,
                    fileId: file.id, // Store GridFS file ID
                    uploadDate: moment().format('YYYY-MM-DD')
                };

                const newBook = await bookShelf.create(bookData);
                results.success++;
                results.successfulUploads.push({
                    fileName: file.originalname,
                    bookId: newBook._id
                });

            } catch (uploadError) {
                results.failed++;
                results.failedUploads.push({
                    fileName: file.originalname,
                    error: uploadError.message
                });

                // Delete file from GridFS if database entry fails
                await gfs.remove({ _id: file.id, root: 'uploads' });
            }
        }

        res.status(201).json({
            message: 'Upload process completed',
            summary: {
                totalProcessed: results.totalFiles,
                successfulUploads: results.success,
                failedUploads: results.failed
            },
            details: {
                successful: results.successfulUploads,
                failed: results.failedUploads
            }
        });

    } catch(error) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                message: 'File size too large. Maximum size is 30MB'
            });
        }
        res.status(500).json({
            message: 'Error in upload process',
            error: error.message
        });
    }
};

// New endpoint to get file
exports.getFile = async (req, res) => {
    try {
        const file = await gfs.files.findOne({ filename: req.params.filename });
        if (!file) {
            return res.status(404).json({ message: 'File not found' });
        }

        const readStream = gfs.createReadStream(file.filename);
        readStream.pipe(res);
    } catch (error) {
        res.status(500).json({
            message: 'Error retrieving file',
            error: error.message
        });
    }
};

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
exports.getId = async(req,res) => {
    try {
        const bookId = req.params.id;
        const book = await bookShelf.findById(bookId);
        
        if(!book) {
            return res.status(404).json({ message: 'Book not found' });
        }
        res.status(200).json(book);
    } catch(err) {
        res.status(500).json({ 
            message: 'Error fetching book', 
            error: err.message 
        });
    }
}

// Modified delete endpoint
exports.deleteBook = async (req, res) => {
    try {
        const bookId = req.params.id;
        const book = await bookShelf.findById(bookId);
        
        if (!book) {
            return res.status(404).json({
                success: false,
                message: 'Book not found'
            });
        }

        // Delete file from GridFS
        if (book.fileId) {
            await gfs.remove({ _id: book.fileId, root: 'uploads' });
        }

        // Delete book record
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

