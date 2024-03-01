const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");

const db = require("./reddit-fake-db-exemp");
const usersRouter = require("./router/usersRouter.js");
const subsRouter = require("./router/subRouter.js");
const articlesRouter = require("./router/articlesRouter.js");
const commentsRouter = require("./router/commentsRouter.js");

const app = express();
const port = 3000;

app.use(express.static("public")); //font, img should inside public folder
app.use(bodyParser.urlencoded({ extended: false }));

app.use(
  cookieSession({
    name: "session",
    keys: ["put_a_key_here_i_guess"],
  })
);

app.set("view engine", "ejs");

// I personally made two custom middlewares here.  You might want to, if it helps you.

app.get("/", (req, res) => {
  // res.send("Hello, World")
  res.redirect("/subs/list");
});

app.use("/subs", subsRouter);
app.use("/articles", articlesRouter);
app.use("/comments", commentsRouter);
app.use("/users", usersRouter);

app.get("/debugPage", (req, res) => {
  const username = req.session.user;
  res.render("debugPage", { username: username });
});

app.get("/debug_db", (req, res) => {
  db.debug.log_debug();
  res.send("check the server console.   <a href='/'>To Home</a>");
});

app.post("/reset_db", (req, res) => {
  db.debug.reset_and_seed();
  db.debug.log_debug();
  res.send("database reset; check the server console.   <a href='/'>To Home</a>");
}); //nodemon reset_db effects to Json file too. use  "start": "nodemon index.js --ignore *.json"

app.listen(port, () => {
  console.log(`Example app listening on port http://localhost:${port}`);
});
