const express = require('express');
const router = express.Router();

const db = require('../reddit-fake-db-pass');

router.get('/show/:id', (req, res) => {
  const username = req.session.user;
  const articleId = req.params.id;
  const articleDetail = db.articles.get_byId(articleId, { withComments: true, withCreator: true });
  
  if (!articleDetail) { 
    return res.render('error', {msg: "not exist"});
  }
  const articleComments = articleDetail.comments;
  
  res.render('articleShow', { detail: articleDetail, comments: articleComments, username: username, title: articleDetail.id });
}) 

router.get('/create/:sub', (req, res) => {
  const username = req.session.user;
  const sub = req.params.sub;
  res.render('articleCreate', { sub: sub, username: username });
})

router.post('/create/:id', (req, res) => {  // "path pattern"
  const id = req.params.id;
  const title = req.body.title;
  const user = req.session.user;
  const creator = db.users.get_byUsername(user);
  // console.log(creator)
  const link = req.body.link;
  const contents = req.body.contents;
  const newArticle = db.articles.create({sub: id, title: title, creator: creator.id, link: link, text: contents});
  res.redirect(`/articles/show/${newArticle.id}`);
}) 

router.get('/edit/:id', (req, res) => {
  const username = req.session.user;
  // console.log(username);
  const id = req.params.id;
  // console.log(id);
  const articles = db.articles.get_byFilter(article => article.id === id);
  res.render('articleEdit', {username: username, detail: articles, id: id});
});

router.post('/edit/:id', (req, res) => {
  // const username = req.session.user;
  const id = req.params.id;
  const articles = db.articles.get_byFilter(article => article.id === id);
  if (articles.length === 0) {
    return res.render('error', { msg: "no article" });
  }
  const article = articles[0];
  const newTitle = req.body.title;
  const newLink = req.body.link;
  const newContents = req.body.contents;
  const editArticle = db.articles.update({id: article.id, title: newTitle, link: newLink, text: newContents});
  res.redirect(`/articles/show/${editArticle.id}`);
});

router.get('/delete/:article', (req, res) => {
  const username = req.session.user;
  const title = req.params.article;
  res.render('articleDelete', {title: title, username : username});
});

router.post('/delete/:article', (req, res) => {
  const title = req.params.article;
  const articles = db.articles.get_byFilter(article => article.title === title);

  if (articles.length === 0) {
    return res.render('error', {msg: "no article"});
    
  } else if (articles.length > 1) {
    
    return res.render('error', {msg: "too much articles"});
  }
  let article = articles[0];
  const deleteArticle = db.articles.delete(article.id);
  res.redirect(`/subs/show/${article.sub_name}`);
});


module.exports = router;