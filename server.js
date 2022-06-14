const express = require("express");
const passport = require("passport");
const session = require("express-session");
const { Strategy } = require("passport-discord");
const mongoose = require("mongoose");
const Blog = require("./veri.js");
const bp = require("body-parser");
const fetch = require("node-fetch");
const app = express();

app.use(bp.urlencoded({ extended: false }))

app.use(bp.json())

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

const strategy = new Strategy(
	{
		clientID: "978690143848378428",
		clientSecret: "ljVCF0XdT0rOfa5_V6i0eUMyZicdg4tS",
		callbackURL: "https://uptime.stalinjunior.xyz/callback",
		scope: ["identify"],
	},
	(_access_token, _refresh_token, user, done) =>
		process.nextTick(() => done(null, user)),
);

passport.use(strategy);

app.use(
	session({
		secret: "secret",
		resave: false,
		saveUninitialized: false,
	}),
);
app.use(passport.session());
app.use(passport.initialize());

app.get(
	"/login",
	passport.authenticate("discord", {
		scope: ["identify"],
	}),
);

app.get(
	"/callback",
	passport.authenticate("discord", {
		failureRedirect: "/error",
	}),
	(_req, res) => res.redirect("/"),
);

app.get("/", (req, res) => {
	res.render(process.cwd() + "/public/index.ejs", { user: req.user })
});

setInterval(() => {
  mongoose.connect("mongodb+srv://uzayarsiv:uzayarsiv@cluster0.4fajo.mongodb.net/uptime?retryWrites=true&w=majority", function (err,db) {
  const uptime = db.collection("uptimes");
  uptime.forEach(x => {
    fetch(x.link)
  })
  })
}, 60000)

app.get("/dashboard", (req, res) => {
  mongoose.connect("mongodb+srv://uzayarsiv:uzayarsiv@cluster0.4fajo.mongodb.net/uptime?retryWrites=true&w=majority", function (err,db) {
  const links = db.collection("uptimes")
  links.find({ id: req.user.id }).toArray(function (err, result){
  links.find({}).toArray(function (err, up){  
  up.forEach(site =>{
    fetch(site.link).then(res => { status = res.status; return res.text() } )
  .then(d => {
    res.render(process.cwd() + "/public/dash.ejs", { user: req.user, result: result, status: status })
  })
  })
    })
    })
  })
});

app.get("/logout", (req, res) => {
    req.session.destroy();
    return res.redirect("/");
  });

app.get("/mainsite", (req, res) => {
    res.redirect("https://stalinjunior.xyz")
})

app.post("/dashboard", (req, res) => {
  mongoose.connect("mongodb+srv://uzayarsiv:uzayarsiv@cluster0.4fajo.mongodb.net/uptime?retryWrites=true&w=majority", function (err,db) {
  const links = db.collection("uptimes")
  links.find({ id: req.user.id }).toArray(function (err, result){ 
    if(req.user){
  if(result.length >= 3) {
    res.redirect("/dashboard")
  }else if(result.link === req.body.link) {
    res.redirect("/dashboard")
  }else{
    links.insert({ "link": req.body.link, "id": req.user.id }, function (err, result){         
      res.end(result)  
      return res.redirect("/dashboard")
    })
    }
  }
  })
  })
})

app.get("/dashboard/remove/:id", (req, res) => {
  mongoose.connect("mongodb+srv://uzayarsiv:uzayarsiv@cluster0.4fajo.mongodb.net/uptime?retryWrites=true&w=majority", function (err,db) {
  const links = db.collection("uptimes")
  links.remove({"_id": mongoose.Types.ObjectId(`${req.params.id}`)})
  res.redirect("/dashboard")
  })
})

app.listen(3000, () => {
	console.log("server active");
});