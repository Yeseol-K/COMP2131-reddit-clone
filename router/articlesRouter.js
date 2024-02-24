const express = require('express');
const router = express.Router();
const db = require('../reddit-fake-db-pass');

router.get('/show/:id', (req, res) => {
  try {
    const username = req.session.user;
    const articleId = req.params.id;
    const articleDetail = db.articles.get_byId(articleId, { withComments: true, withCreator: true });

    if (!articleDetail) {
      throw new Error("Article does not exist");
    }

    const articleComments = articleDetail.comments;

    res.render('articleShow', { detail: articleDetail, comments: articleComments, username, title: articleDetail.id });
  } catch (error) {
    res.render('error', { msg: "Error displaying article" });
  }
});

router.get('/create/:sub', (req, res) => {
  try {
    const username = req.session.user;
    const sub = req.params.sub;
    res.render('articleCreate', { sub, username });
  } catch (error) {
    res.render('error', { msg: "Error rendering article creation page" });
  }
});

router.post('/create/:id', (req, res) => {
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
    res.render('error', { msg: "Error creating article" });
  }
});

router.get('/edit/:id', (req, res) => {
  try {
    const username = req.session.user;
    const id = req.params.id;
    const articles = db.articles.get_byFilter(article => article.id === id);
    res.render('articleEdit', { username, detail: articles, id });
  } catch (error) {
    res.render('error', { msg: "Error rendering article editing page" });
  }
});

router.post('/edit/:id', (req, res) => {
  try {
    const id = req.params.id;
    const articles = db.articles.get_byFilter(article => article.id === id);

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
    res.render('error', { msg: "Error editing article"});
  }
});

router.get('/delete/:article', (req, res) => {
  try {
    const username = req.session.user;
    const title = req.params.article;
    res.render('articleDelete', { title, username });
  } catch (error) {
    res.render('error', { msg: "Error rendering article deletion page" });
  }
});

router.post('/delete/:article', (req, res) => {
  try {
    const title = req.params.article;
    const articles = db.articles.get_byFilter(article => article.title === title);

    if (articles.length === 0) {
      throw new Error("No article found");
    } else if (articles.length > 1) {
      throw new Error("Too many articles found");
    }

    const article = articles[0];
    const deleteArticle = db.articles.delete(article.id);
    res.redirect(`/subs/show/${article.sub_name}`);
  } catch (error) {
    res.render('error', { msg: "Error deleting article" });
  }
});

module.exports = router;