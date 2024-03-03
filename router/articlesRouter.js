const express = require("express");
const router = express.Router();
const db = require("../reddit-fake-db-exemp");

// Show article
router.get("/show/:id", (req, res) => {
  try {
    const username = req.session.user || null;
    const voter = db.users.get_byUsername(username);
    const articleId = req.params.id;

    const ordering = req.query.order_by || "new";

    const sortForNew = (a, b) => b.ts - a.ts;
    const sortForOld = (a, b) => a.ts - b.ts;
    const sortVoteUP = (a, b) => b.votes - a.votes;
    const sortVoteDown = (a, b) => a.votes - b.votes;

    let orderingCb = sortForNew;
    if ("need condition") {
      orderingCb = sortForOld;
    } else if ("need condition") {
      orderingCb = sortVoteUP;
    } else if ("need condition") {
      orderingCb = sortVoteDown;
    }

    const articleDetail = db.articles.get_byId(articleId, {
      withComments: true,
      withCreator: true,
      withVotes: true,
      withCurrentVote: voter,
      order_by: orderingCb,
    });

    // console.log("1", articleDetail.ts, articleDetail.upvotes - articleDetail.downvotes);

    const articleVote = Number(articleDetail.upvotes - articleDetail.downvotes);

    if (!articleDetail || !articleDetail.comments || !articleDetail.creator) {
      return res.render("error", { msg: "Invalid article" });
    }

    const imageExtensions = [".jpg", ".jpeg", ".gif", ".png"];
    const isImage = imageExtensions.some((extension) => articleDetail.link.toLowerCase().endsWith(extension));

    const articleComments = articleDetail.comments;
    let commentVote = [];
    for (let i = 0; i < articleComments.length; i++) {
      const vote = Number(articleComments[i].upvotes - articleComments[i].downvotes);
      commentVote.push(vote);
    }

    res.render("articleShow", {
      article: articleDetail,
      comments: articleComments,
      username,
      isImage,
      title: articleDetail.id,
      voter: voter ? voter.username : null,
      commentVote: commentVote,
      articleVote: articleVote,
      ordering,
    });
  } catch (error) {
    console.error(error);
    res.render("error", { msg: "Error displaying article" });
  }
});

// Vote article
router.post("/vote/:id/:votevalue", (req, res) => {
  try {
    const username = req.session.user;
    const voter = db.users.get_byUsername(username);

    if (!voter) {
      throw new Error("User not found");
    }

    const articleId = req.params.id;
    const voteValue = req.params.votevalue;
    const article = db.articles.get_byId(articleId);

    if (!article) {
      throw new Error("Article not found");
    }

    const currentVote = db.articles.get_vote({ article, voter });

    if (currentVote) {
      if (currentVote.vote_value === Number(voteValue)) {
        db.articles.remove_vote({ article, voter });
      } else {
        db.articles.set_vote({ article, voter, vote_value: Number(voteValue) });
      }
    } else {
      db.articles.set_vote({ article, voter, vote_value: Number(voteValue) });
    }

    const referer = req.header("Referer") || "/articles/show/" + articleId;
    res.redirect(referer);
  } catch (error) {
    console.error(error.message);
    res.render("error", { msg: "Error article vote" });
  }
});

// Create new article page
router.get("/create/:sub", (req, res) => {
  try {
    const username = req.session.user;
    const sub = req.params.sub;
    res.render("articleCreate", { sub, username });
  } catch (error) {
    res.render("error", { msg: "Error rendering article creation page" });
  }
});

// Create new article
router.post("/create/:id", (req, res) => {
  try {
    const id = req.params.id;
    const title = req.body.title;
    const user = req.session.user;
    const creator = db.users.get_byUsername(user);
    const link = req.body.link;
    const contents = req.body.contents;
    const newArticle = db.articles.create({ sub: id, title, creator: creator.id, link, text: contents });
    res.redirect(`/articles/show/${newArticle.id}`);
  } catch (error) {
    res.render("error", { msg: "Error creating article" });
  }
});

// Edit article page
router.get("/edit/:id", (req, res) => {
  try {
    const username = req.session.user;
    const id = req.params.id;
    const articles = db.articles.get_byFilter((article) => article.id === id);
    res.render("articleEdit", { username, detail: articles, id });
  } catch (error) {
    res.render("error", { msg: "Error rendering article editing page" });
  }
});

//Edit article
router.post("/edit/:id", (req, res) => {
  try {
    const id = req.params.id;
    const articles = db.articles.get_byFilter((article) => article.id === id);

    if (articles.length === 0) {
      throw new Error("No article found");
    }

    const article = articles[0];
    const newTitle = req.body.title;
    const newLink = req.body.link;
    const newContents = req.body.contents;
    const editArticle = db.articles.update({ id: article.id, title: newTitle, link: newLink, text: newContents });
    res.redirect(`/articles/show/${editArticle.id}`);
  } catch (error) {
    res.render("error", { msg: "Error editing article" });
  }
});

//Delete article page
router.get("/delete/:article", (req, res) => {
  try {
    const username = req.session.user;
    const title = req.params.article;
    res.render("articleDelete", { title, username });
  } catch (error) {
    res.render("error", { msg: "Error rendering article deletion page" });
  }
});

//Delete article
router.post("/delete/:article", (req, res) => {
  try {
    const title = req.params.article;
    const articles = db.articles.get_byFilter((article) => article.title === title);

    if (articles.length === 0) {
      throw new Error("No article found");
    } else if (articles.length > 1) {
      throw new Error("Too many articles found");
    }

    const article = articles[0];
    const deleteArticle = db.articles.delete(article.id);
    res.redirect(`/subs/show/${article.sub_name}`);
  } catch (error) {
    res.render("error", { msg: "Error deleting article" });
  }
});

module.exports = router;
