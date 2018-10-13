
var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var exhbs = require("express-handlebars");
var request = require("request");
var mongojs = require("mongojs");


// Initialize Express
var app = express();
var PORT = 8080;
var db = require("./models");


app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrape", { useNewUrlParser: true });


// Database configuration
//var databaseUrl = "scraper";
//var collections = ["scrapedData"];



/*
// Hook mongojs configuration to the db variable
var db = mongojs(databaseUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});


*/
// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
  // Make a request for the news section of `ycombinator`
   request("https://www.nytimes.com/section/sports/soccer", function (error, response, html) {

    // Load the html body from request into cheerio
    var $ = cheerio.load(html);
    // For each element with a "title" class
    $(".story-body").each(function(i, element) {
      // Save the text and href of each link enclosed in the current element
   
       var result = {};
   
       result.title = $(this).find("h2").text();
       result.summary = $(this).find("p").text();
       result.link = $(this).children("a").attr("href");
       result.imgLink = $(this).find("img").attr("src").split(",")[0].split(" ")[0];

      // If this found element had both a title and a link

      /*
      
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
        */


   // Create a new Article using the `result` object built from scraping
   db.Article.create(result)
   .then(function(dbArticle) {
     // View the added result in the console
     console.log(dbArticle);
   })
   .catch(function(err) {
     // If an error occurred, send it to the client
     return res.json(err);
   });

  

    });
  });

  // Send a "Scrape Complete" message to the browser
  res.send("Scrape Complete");
});

app.get("/all", function(req, res) {
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







// Listen on port 3000
app.listen(PORT, function () {
    console.log("App running on port!" + PORT);
});













