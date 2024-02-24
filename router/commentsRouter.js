const express = require('express');
const router = express.Router();

const db = require('../reddit-fake-db-pass');

router.get('/show/:id', (req, res) => {
  const username = req.session.user; //cat
  const commentId = req.params.id;//3297
  const commentDetail = db.comments.get_byId(commentId, { withCreator: true, reserved_for_later: true })//same id comment
  res.render('commentShow', {username: username, commentId: commentId, comment: commentDetail})
});

router.post('/create/:id', (req, res) => {
  const user = req.session.user; //cat login user
  // const id = req.params.id;//new comment id(random num)
  const creator = db.users.get_byUsername(user);//cat info
  const comment = req.body.comment;//new comment content
  const article = req.params;
  // console.log(article);
  const ts = Date.now();
  const newComment = db.comments.create({ creator: creator.id, text: comment, article: article, ts: ts})
  res.redirect(`/comments/show/${newComment.id}`);
});

router.get('/edit/:id', (req, res) => {
  const username = req.session.user;
  const commentId = req.params.id;//comment writer id
  const comment = db.comments.get_byFilter(comment => comment.id === commentId);
  
  res.render('commentEdit', {username: username, commentId: commentId, comment: comment});
});

router.post('/edit/:id', (req, res) => {
  const commentId = req.params.id;
  const newComment = req.body.contents;
  const editComment = db.comments.update({id: commentId, text: newComment});
  res.redirect(`/comments/show/${editComment.id}`);
});

router.get('/delete/:id', (req, res) => {
  const username = req.session.user;
  const commentId = req.params.id;
  res.render('commentDelete', {username : username, id: commentId});
});

router.post('/delete/:id', (req, res) => {
  const username = req.session.user;
  const commentId = req.params.id;
  const comments = db.comments.get_byFilter(comment => comment.id === commentId);
  if (comments.length === 0) {
    return res.render('error', {msg: "no article"});
 } 
  let comment = comments[0];
  console.log("delete", comments)
  res.redirect(`/articles/show/${comment.article_id}`);
});

module.exports = router;