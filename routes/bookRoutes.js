const express = require('express')
const router = express.Router();
const Controller = require('../controllers/bookController')

router.get('/',Controller.displayBooks)
router.get('/:id',Controller.getId)
router.post('/upload', Controller.upload.single('file'), Controller.uploadBook)
router.get('/search/title/:title', Controller.findBookTitle)
router.get('/search/author/:author', Controller.findBookAuthor)
router.get('/search/category/:category', Controller.findBookCategory)
router.get('/search', Controller.search)
router.delete('/:id', Controller.deleteBook)

module.exports = router