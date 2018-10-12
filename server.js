/*
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var exhbs = require("express-handlebars");
var request = require("request");

var PORT = 8080;
db = require("./models");
//Initialize Express 
var app = express();
// Body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect to the Mongo DB
mongoose.connect("mongodb://mongodb://localhost/scrape", { useNewUrlParser: true });

// A Get route for scraping the website
app.get("/scrape", function (req, res) {
    // Make a request for the news section of the website
    request("https://www.nytimes.com/section/sports/soccer", function (error, response, html) {
        var $ = cheerio.load(html);
        // For each element with a "title" class

        $(".title").each(function (i, element) {

            // save an empty result object 
            var result = {};

            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

         // Create a new Article using the result object  built for scraping
        db.Article.create(result)
        .then(function(dbArticle){
            console.log(dbArticle)
            // view the added result in the console
        })
         .catch(function(err){
             // if an error occured, send it to the client
             return res.json(err);
         })
         // if we were able to successfully scrape and save and save an article send the message to the client
           res.send("Scrape complete");
        });
    });

    // Send a "Scrape Complete" message to the browser
    res.send("Scrape Complete");
});

 
    // Route for getting all Articles from the db
app.get("/articles", function(req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
      .then(function(dbArticle) {
        // If we were able to successfully find Articles, send them back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });
  
  // Route for grabbing a specific Article by id, populate it with it's note
  app.get("/articles/:id", function(req, res) {
    // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
    db.Article.findOne({ _id: req.params.id })
      // ..and populate all of the notes associated with it
      .populate("note")
      .then(function(dbArticle) {
        // If we were able to successfully find an Article with the given id, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

   // Route for saving/updating an Article's associated Note
app.post("/articles/:id", function(req, res) {
    // Create a new note and pass the req.body to the entry
    db.Note.create(req.body)
      .then(function(dbNote) {
        // If a Note was created successfully, find one Article with an `_id` equal to `req.params.id`. Update the Article to be associated with the new Note
        // { new: true } tells the query that we want it to return the updated User -- it returns the original by default
        // Since our mongoose query returns a promise, we can chain another `.then` which receives the result of the query
        return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
      })
      .then(function(dbArticle) {
        // If we were able to successfully update an Article, send it back to the client
        res.json(dbArticle);
      })
      .catch(function(err) {
        // If an error occurred, send it to the client
        res.json(err);
      });
  });

// Listen on port 3000
app.listen(PORT, function () {
    console.log("App running on port!" + PORT);
});


*/




// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require request and cheerio. This makes the scraping possible
var request = require("request");
var cheerio = require("cheerio");

// Initialize Express
var app = express();

// Database configuration
var databaseUrl = "scraper";
var collections = ["scrapedData"];

//var databaseUrl = "zoo";
//var collections = ["places"];

// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

// Main route (simple Hello World Message)
app.get("/", function(req, res) {
  res.send("Hello world");
});

// Retrieve data from the db
app.get("/all", function(req, res) {
  // Find all results from the scrapedData collection in the db
  db.scrapedData.find({}, function(error, found) {
    // Throw any errors to the console
    if (error) {
      console.log(error);
    }
    // If there are no errors, send the data to the browser as json
    else {
      res.json(found);
    }
  });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`
   request("https://www.nytimes.com/section/sports/soccer", function (error, response, html) {

    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".story-body").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
   
      var title = $(element).find("h2").text();
      var summary = $(element).find("p").text();
      var link = $(element).children("a").attr("href");
      var imgLink = $(element).find("img").attr("src").split(",")[0].split(" ")[0];

      // If this found element had both a title and a link
      if (title && link && summary && imgLink) {
        // Insert the data in the scrapedData db
        db.scrapeData.insert({
          title: title,
          summary:summary,
          link: link,
          imgLink: imgLink

        },
        function(err, inserted) {
          if (err) {
            // Log the error if one is encountered during the query
            console.log(err);
          }
          else {
            // Otherwise, log the inserted data
            console.log(inserted);
          }
        });
      }
    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});


// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});




