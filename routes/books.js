const express = require("express");
const router = express.Router();

const Book = require('../models/books');
const Author = require('../models/author');
const imageMimeType = ['image/jpeg', 'image/png', 'image/gif'];


/**************** Routes ***************/

// Get all the Books
router.get("/", async (req, res) => {
    let query = Book.find();
    // Query from title
    if(req.query.title != null && req.query.title != ''){
        query = query.regex('title', new RegExp(req.query.title, 'i')); // We are building the query here
    }
    // Query from Published After
    if(req.query.publishedAfter != null && req.query.publishedAfter != ''){
        query = query.gte('publishDate', req.query.publishedAfter); // We are building the query here
    }
    // Query from Publish Before
    if(req.query.publishedBefore != null && req.query.publishedBefore != ''){
        query = query.lte('publishDate', req.query.publishedBefore); // We are building the query here
    }

    try{
        const books = await query.exec(); // query is executed here
        res.render("books/index", {
            books: books,
            searchOptions: req.query
        })
    } catch {
        res.redirect('/')
    }
});

// Get new Book
router.get("/new", async (req, res) => {
    renderNewPage(res, new Book());
});

// Create a new Book
router.post("/", async (req, res) => {
    const book = new Book({
        title: req.body.title,
        author: req.body.author,
        publishDate: new Date( req.body.publishDate ),
        pageCount: req.body.pageCount,
        description: req.body.description
    });

    saveCover(book, req.body.cover);

    try{
        const newBook = await book.save();
        // res.redirect(`books/${newBook.id}`);
        res.redirect(`books`);
    } catch {
        renderNewPage(res, book, true);
    }
});

/**************** Functions ***************/

async function renderNewPage(res, book, hasError = false){
    try{
        const authors = await Author.find({});
        const params = { authors: authors, book: book}
        if(hasError) params.errorMessage = 'Error Creating Book'
        res.render('books/new', params);
    } catch {
        res.redirect('/books');
    }
}

function saveCover(book, coverEncoded){
    if(coverEncoded == null) return
    const cover = JSON.parse(coverEncoded);
    if(cover != null && imageMimeType.includes(cover.type)){
        book.coverImage = new Buffer.from(cover.data, 'base64');
        book.coverImageType = cover.type;
    }
}

module.exports = router;