const express = require("express");
const router = express.Router();

const Book = require('../models/book');
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
        res.redirect(`books/${newBook.id}`);
    } catch {
        renderNewPage(res, book, true);
    }
});


// Show Book | will show the Information of one specific book
router.get("/:id", async (req, res) => {
    try{
        const book = await Book.findById(req.params.id).populate('author').exec();
        res.render("books/show", {book: book});
    } catch {
        res.redirect("/");
    }
});

// Edit Book
router.get("/:id/edit", async (req, res) => {
    try{
        const book = await Book.findById(req.params.id);
        renderEditPage(res, book);
    } catch {
        res.redirect("/");
    }
});

// Updating book
router.put("/:id", async (req, res) => {
    let book;
    try{
        book = await Book.findById(req.params.id);
        book.title = req.body.title;
        book.author = req.body.author;
        book.publishDate = new Date(req.body.publishDate);
        book.pageCount = req.body.pageCount;
        book.description = req.body.description;
        if(req.body.cover != null && req.body.cover !== ''){
            saveCover(book, req.body.cover)
        }
        await book.save();
        res.redirect(`/books/${book.id}`);
    } catch {
        if(book != null){
            renderEditPage(res, book, true);
        } else {
            res.redirect("/");
        }
    }
});

// Deleting book
router.delete("/:id", async (req, res) => {
    let book;
    try{    
        book = await Book.findById(req.params.id);
        await book.remove();
        res.redirect("/books");
    } catch {
        if(book != null){
            res.render("books/show", { book: book, errorMessage: "Could not remove book"})
        } else {
            res.redirect("/");
        }
    }
})


/**************** Functions ***************/

async function renderNewPage(res, book, hasError = false){
    renderFormPage(res, book, 'new', hasError);
}

async function renderEditPage(res, book, hasError = false){
    renderFormPage(res, book, 'edit', hasError);
}


async function renderFormPage(res, book, form, hasError = false){
    try{
        const authors = await Author.find({});
        const params = { authors: authors, book: book}
        if(hasError){
            if(form === 'edit') {
                params.errorMessage = 'Error Updating Book'
            } else{
            params.errorMessage = 'Error Creating Book'
            }
        }
        res.render(`books/${form}`, params);
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