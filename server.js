
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var request = require("request");
require('dotenv').config();


var Comment = require("./models/Comment.js");
var Article = require("./models/Article.js");


if(process.env.NODE_ENV == 'production'){
  mongoose.connect(`mongodb://${process.env.USER_NAME}:${process.env.USER_PASSWORD}@ds261429.mlab.com:61429/heroku_2jc810zq`);
}
else{
  mongoose.connect('mongodb://localhost/scrape');
}
var db = mongoose.connection;

// Show any Mongoose errors
db.on('error', function(err) {
  console.log('Mongoose Error: ', err);
});

// Once logged in to the db through mongoose, log a success message
db.once('open', function() {
  console.log('Mongoose connection successful.');
});



// Initialize Express
var app = express();
var PORT = 8080;

app.use(express.static("public"));

app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");


app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrape", { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);


// Index Page Render (first visit to the site)
app.get('/', function (req, res) {

  // Scrape data
  res.redirect('/scrape');

});

// Web Scrape Route
app.get('/scrape', function (req, res) {

  // First, grab the body of the html with request
  request("https://www.nytimes.com/section/sports/soccer", function (error, response, html) {

    // Then, load html into cheerio and save it to $ for a shorthand selector
    var $ = cheerio.load(html);

    // This is an error handler for duplicate articles 
    var titlesArray = [];

    // Now, we grab every h2 within an article tag, and do the following:
    $('.story-body').each(function (i, element) {

      //save an empty result object
      var result = {};

      // Add the text and href of every link, and save them as properties of the result object
      result.title = $(this).find("h2").text();
      result.summary = $(this).find("p").text();
      result.link = $(this).children("a").attr("href");
      result.imgLink = $(this).find("img").attr("src").split(",")[0].split(" ")[0];


      if (result.title !== "" && result.summary !== "") {

        if (titlesArray.indexOf(result.title) == -1) {

          titlesArray.push(result.title);

          // Only add the entry to the database if is not already there
          Article.count({ title: result.title }, function (err, item) {

            // If the count is 0, then the entry is unique and should be saved
            if (item == 0) {


              var entry = new Article(result);

              // Save the entry to MongoDB
              entry.save(function (err, doc) {
                // log any errors
                if (err) {
                  console.log(err);
                }
                // or log the doc that was saved to the DB
                else {
                  console.log(doc);
                }
                });

             }

          });
        }

     }

 });

    // Redirect to the Articles Page, done at the end of the request for proper scoping
    res.redirect("/articles");

  });

});


// Articles Page Render
app.get('/articles', function (req, res) {

  // Grap every Article
  Article.find({})

    // But also populate all of the comments associated with the articles.
    .populate('comments')

    // Then, send them to the handlebars template to be rendered
    .exec(function (err, doc) {
      // log any errors
      if (err) {
        console.log(err);
      }
      // or send the doc to the browser as a json object
      else {
        var hbsObject = { articles: doc }
        res.render('index', hbsObject);
      }
    });

});


// Add a Comment Route 
app.post('/add/:id', function (req, res) {

  var id = req.params.id;
  var cAuthor = req.body.name;
  var cContent = req.body.comment;

  // "result" object has the exact same key-value pairs of the "Comment" model
  var result = {
    author: cAuthor,
    content: cContent
  };

  // Using the Comment model, create a new comment entry
  var entry = new Comment(result);

  // Save the entry to the database
  entry.save(function (err, doc) {
    // log any errors
    if (err) {
      console.log(err);
    }
    // Or, relate the comment to the article
    else {
      // Push the new Comment to the list of comments in the article
      Article.findOneAndUpdate({ '_id': id }, { $push: { 'comments': doc._id } }, { new: true })
        // execute the above query
        .exec(function (err, doc) {
          // log any errors
          if (err) {
            console.log(err);
          } else {
            res.redirect("/articles");
          }
        });
    }
  });

});

// Delete a Comment Route
app.post('/delete/:id', function (req, res) {

  // Collect comment id
  var commentId = req.params.id;

  // Find and Delete the Comment using the Id
  Comment.findByIdAndRemove(commentId, function (err, todo) {

    if (err) {
      console.log(err);
    }
    else {
      res.redirect("/articles");
    }

  });

});

app.listen(PORT, function () {
  console.log("App running on port!" + PORT);
});











