//Check if we are running in the production environment
if(process.env.NODE_ENV !== "production"){require('dotenv').config()}

const express = require("express");
const app = express();
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const indexRouter = require('./routes/index');
const authorRouter = require('./routes/authors');

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views'); // where the views will be coming from
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(express.static('public')); // where the style sheets, javascripts...
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false}));

mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true}); // Making connection to the datasbe
const db = mongoose.connection;
db.on('error', error => console.error(error));
db.once('open', () => console.log("Connected to Mongoose"));

app.use('/', indexRouter);
app.use('/authors', authorRouter); // When we go to the author route the url will be pre-appended with the /authors/

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running");
}); 