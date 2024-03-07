const express = require("express");
const router = express.Router();
const db = require("../reddit-fake-db-exemp");

router.get("/list", (req, res) => {
  try {
    const username = req.session.user;
    const subredditList = db.subs.list();
    const subNames = subredditList.map((sub) => sub.name);
    res.render("subsList", { names: subNames, username });
  } catch (error) {
    res.render("error", { msg: "Error fetching subreddit list" });
  }
});

router.get("/show/:sub", (req, res) => {
  try {
    const username = req.session.user;
    const sub = req.params.sub;
    const articleVotes = [];
    const voter = db.users.get_byUsername(username);

    const order_by = req.query.ordering || "new";
    const getOrderFunction = (order) => {
      const orderFunctions = {
        top: (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
        ragebait: (a, b) => a.upvotes - a.downvotes - (b.upvotes - b.downvotes),
        new: (a, b) => b.ts - a.ts,
        old: (a, b) => a.ts - b.ts,
      };
      return orderFunctions[order];
    };

    const orderFunction = getOrderFunction(order_by);
    const articles = db.articles.get_byFilter((article) => article.sub_name === sub, { withVotes: true, order_by: orderFunction });

    const detailedArticles = [];

    for (const article of articles) {
      const articleDetail = db.articles.get_byId(article.id, {
        withComments: true,
        withCreator: true,
        withVotes: true,
        withCurrentVote: voter,
      });
      const articleVote = Number(articleDetail.upvotes - articleDetail.downvotes);
      articleVotes.push(articleVote);
      detailedArticles.push(articleDetail);
    }

    res.render("subsShow", {
      sub,
      articles,
      article: detailedArticles,
      vote: articleVotes,
      username,
      ordering: order_by,
    });
  } catch (error) {
    res.render("error", { msg: "Error fetching subreddit list" });
  }
});

router.get("/create/:sub", (req, res) => {
  try {
    const username = req.session.user;
    const sub = req.params.sub;
    res.render("subCreate", { sub, username });
  } catch (error) {
    res.render("error", { msg: "Error rendering subreddit creation page" });
  }
});

router.post("/create/:sub", (req, res) => {
  try {
    const sub = req.params.sub;
    const newSubName = req.body.name;
    const username = req.session.user;
    const creator = db.users.get_byUsername(username);

    if (!sub) {
      throw new Error("Subreddit name is required");
    } else if (!creator) {
      throw new Error("User not found");
    } else {
      db.subs.create({ name: newSubName, creator: creator.id });
      res.redirect(`/subs/show/${newSubName}`);
    }
  } catch (error) {
    res.render("error", { msg: "Error creating subreddit" });
  }
});

module.exports = router;
