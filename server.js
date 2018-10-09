var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var cheerio = require("cheerio");
var exhbs = require("express-handlebars");

var PORT = 8080;

//Initialize Express 
var app = express();
// Body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

//connect to the Mongo DB
mongoose.connect("mongodb://localhost/scrape", { useNewUrlParser: true });

// A Get route for scraping the website
app.get("/scrape", function (req, res) {

    // Make a request for the news section of the website
    request("", function (error, response, html) {
        var $ = cheerio.load(html);
        // For each element with a "title" class

        $(".title").each(function (i, element) {
            var title = $(element).children("a").text();
            var link = $(element).children("a").attr("href");

            // If this found element had both a title and a link

            if (title && link) {
                // Insert the data in the scrapedData db
                db.something.insert({
                    title: title,
                    link: link
                },
                    function (err, inserted) {
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
app.listen(3000, function () {
    console.log("App running on port 3000!");
});