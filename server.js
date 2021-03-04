// LOAD CONFIG
require("dotenv").config();

// DEPENDENCIES
const express = require("express");
const mongoose = require("mongoose");
var expressLayouts = require('express-ejs-layouts');
const session = require("express-session");
const methodOverride = require("method-override");
require("dotenv").config();
const port = process.env.PORT || 3000;
const mongoSessionStore = require("connect-mongo")(session);


// Create express app object
var app = express();

var User = require("./models/user");
const expressEjsLayouts = require("express-ejs-layouts");
//middleware 
app.use(methodOverride("_method"));
app.use(express.static("public"));
app.set("view engine", "ejs");

// MIDDLEWARE 
// use css an js on ejs file
app.use(express.static("public"));
// body parser middleware
app.use(express.urlencoded({ extended: true }));
// Express Layouts
app.use(expressLayouts);

// // ------------- TEST NEW POST -------------
// mongoose.set('useFindAndModify', false); // |
// // -----------------------------------------

mongoose.connect(
    process.env.mongodb,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => console.log(`MongoDb connected to ${process.env.mongodb}`)
);

app.use(session({
    store: new mongoSessionStore({ mongooseConnection: mongoose.connection }),
    saveUninitialized: true,
    resave: true,
    secret: "Omicron's top secret",
    //the cookie will stay for a  month then it will die
    //                  seconds milliseconds= 1 month
    // it shows how long the session will be valid
    cookie: { maxAge: 30 * 60 * 1000 },
 
}))

app.get("/", (req, res) => {
            res.render("index");
    // if (!req.session.userID) {
    //     res.redirect('/signUp')
    // } else {
    //     res.redirect('/home')
    // } 
});

app.get("/check", (req, res) => {
    User.find().populate()
        //allUsers is array with users that sign up.
        .then((allUsers) => {
            res.render("chackPages", { users: allUsers });
        })
        .catch((err) => console.log(err));

});
app.get("/about", (req, res) => {
res.render("about")
});

//search
app.get('/layout', (req, res) => {
    users =req.session.search;
    res.render('search',{users})
})
app.post("/layout", (req, res) => {
    console.log("search", req.body.name);
    // Authenitcate User
    User.find({username:req.body.name})
    .then(users =>{
        req.session.search = users;
        console.log(users)
        res.redirect('/layout')
    }).catch(err => console.log(err));
});


// routes
app.use(require('./routers/topics'));
app.use(require('./routers/user'))

// listen on port 4000
app.listen(process.env.PORT, function () {
    console.log(`Server is running ${process.env.PORT}`);
});