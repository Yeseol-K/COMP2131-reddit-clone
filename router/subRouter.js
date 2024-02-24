const express = require('express');
const router = express.Router();

const db = require('../reddit-fake-db-pass');


router.get('/list', (req, res) => {
  const username = req.session.user;
  const subredditList = db.subs.list();
  const subNames = subredditList.map(sub => sub.name); 
  res.render('subsList', {names : subNames, username: username});
});

router.get('/show/:sub', (req, res) => {
  const username = req.session.user;
  const sub = req.params.sub;
  const articles = db.articles.get_byFilter(article => article.sub_name === sub);
  res.render('subsShow', {sub: sub, articles : articles, username: username});
});

router.get('/create/:sub', (req, res) => {
  const username = req.session.user;
  const sub = req.params.sub;
  res.render('subCreate', { sub: sub, username: username });
})

router.post('/create/:sub', (req, res) => {
  const sub = req.params.sub;
  const newSubName = req.body.name;
  // console.log("create", newSubName )
  const username = req.session.user;
  const creator = db.users.get_byUsername(username)
  // console.log("create", creator )
  if (!sub) {
    res.render('error', {msg: 'need name'});
  } else if (!creator) {
    res.render('error', {msg: 'need creator'} )
  } else {
    db.subs.create({name: newSubName, creator: creator.id});
    res.redirect(`/subs/show/${newSubName}`);
  }
});

module.exports = router;