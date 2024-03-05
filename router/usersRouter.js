const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const db = require("../reddit-fake-db-exemp");

router.get("/login", (req, res) => {
  try {
    const username = req.session.user;
    res.render("login", { username });
  } catch (error) {
    res.render("error", { msg: "Error rendering login page" });
  }
});

router.post("/login", (req, res) => {
  try {
    const username = req.body.title;
    const password = req.body.password;

    const user = db.users.get_byUsername(username);

    if (!user || user.username !== username) {
      throw new Error("Username does not exist");
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        throw new Error("An error occurred during login");
      }

      if (result === true) {
        req.session.user = user.username;
        res.redirect("/");
      } else {
        res.render("error", { msg: "Password is not correct" });
      }
    });
  } catch (error) {
    res.render("error", { msg: "Error during login" });
  }
});

router.post("/logout", (req, res) => {
  try {
    req.session.user = null;
    res.redirect("/");
  } catch (error) {
    res.render("error", { msg: "Error during logout" });
  }
});

router.get("/register", (req, res) => {
  try {
    const newUser = req.body.title;
    const newPassword = req.body.password;
    res.render("register", { username: newUser });
  } catch (error) {
    res.render("error", { msg: "Error rendering registration page" });
  }
});

router.post("/register", (req, res) => {
  try {
    const newUser = req.body.title;
    const newPassword = req.body.password;
    const password_hash = bcrypt.hashSync(newPassword, 10);

    const user = db.users.create({ username: newUser, password_hash });
    res.render("success", { msg: "Registration successful!" });
  } catch (error) {
    console.error(error);
    res.render("error", { msg: "User already exists" });
  }
});

router.get("/profile/:id", (req, res) => {
  try {
    const username = req.session.user;
    const user = req.params.id;
    const userInfo = db.users.get_byUsername(user);
    const userId = userInfo.id;

    const profileArticle = db.articles.get_byFilter((article) => article.creator_id === userId);
    const profileComment = db.comments.get_byFilter((comment) => comment.creator_id === userId);

    const ordering = req.query.order_by || "new";

    const sortForNew = (a, b) => b.ts - a.ts;
    const sortForOld = (a, b) => a.ts - b.ts;
    const sortVoteUP = (a, b) => b.upvotes + b.downvotes - (a.upvotes + a.downvotes);
    const sortVoteDown = (a, b) => a.upvotes + a.downvotes - (b.upvotes + b.downvotes);

    let orderingCb = sortForNew;
    if (ordering === "old") {
      orderingCb = sortForOld;
    } else if (ordering === "top") {
      orderingCb = sortVoteUP;
    } else if (ordering === "down") {
      orderingCb = sortVoteDown;
    }

    const userDetail = db.users.get_byId(userId, {
      withArticles: true,
      withComments: true,
      withCreator: true,
      withVotes: true,
      withCurrentVote: userInfo,
      order_by: orderingCb,
    });

    const articles = userDetail.articles;
    const articleVote = articles.map((article) => ({
      upvotes: article.upvotes,
      downvotes: article.downvotes,
      totalVotes: article.upvotes - article.downvotes,
    }));

    const comments = userDetail.comments;

    const commentVote = comments.map((comment) => ({
      upvotes: comment.upvotes,
      downvotes: comment.downvotes,
      totalVotes: comment.upvotes - comment.downvotes,
    }));

    res.render("profile", {
      username,
      user,
      article: articles,
      articles: profileArticle,
      articleVote: articleVote,
      comment: comments,
      comments: profileComment,
      commentVote: commentVote,
      ordering: userDetail,
    });
  } catch (error) {
    res.render("error", { msg: "Error rendering user profile" });
  }
});

module.exports = router;
