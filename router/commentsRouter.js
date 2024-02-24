const express = require('express');
const router = express.Router();
const db = require('../reddit-fake-db-pass');

router.get('/show/:id', (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;
    const commentDetail = db.comments.get_byId(commentId, { withCreator: true, reserved_for_later: true });

    if (!commentDetail) {
      throw new Error("Comment not found");
    }

    res.render('commentShow', { username, commentId, comment: commentDetail });
  } catch (error) {
    res.render('error', { msg: "Error fetching comment" });
  }
});

router.post('/create/:id', (req, res) => {
  try {
    const user = req.session.user;
    const creator = db.users.get_byUsername(user);

    if (!creator) {
      throw new Error("User not found");
    }

    const comment = req.body.comment;
    const article = req.params.id;

    if (!article) {
      throw new Error("Article not specified");
    }

    const ts = Date.now();
    const newComment = db.comments.create({ creator: creator.id, text: comment, article, ts });
    res.redirect(`/comments/show/${newComment.id}`);
  } catch (error) {
    res.render('error', { msg: "Error creating comment" });
  }
});

router.get('/edit/:id', (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;
    const comment = db.comments.get_byFilter(comment => comment.id === commentId);

    if (comment.length === 0) {
      throw new Error("Comment not found");
    }

    res.render('commentEdit', { username, commentId, comment});
  } catch (error) {
    res.render('error', { msg: "Error fetching comment for editing" });
  }
});

router.post('/edit/:id', (req, res) => {
  try {
    const commentId = req.params.id;
    const newCommentText = req.body.contents;
    const editComment = db.comments.update({ id: commentId, text: newCommentText });

    if (!editComment) {
      throw new Error("Comment not found");
    }

    res.redirect(`/comments/show/${editComment.id}`);
  } catch (error) {
    res.render('error', { msg: "Error editing comment" });
  }
});

router.get('/delete/:id', (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;
    res.render('commentDelete', { username, id: commentId });
  } catch (error) {
    res.render('error', { msg: "Error fetching comment for deletion" });
  }
});

router.post('/delete/:id', (req, res) => {
  try {
    const commentId = req.params.id;
    const comments = db.comments.get_byFilter(comment => comment.id === commentId);

    if (comments.length === 0) {
      throw new Error("Comment not found");
    }

    const comment = comments[0];
    const deleteComment = db.comments.delete(comment.id)
    res.redirect(`/articles/show/${comment.article_id}`);
  } catch (error) {
    res.render('error', { msg: "Error deleting comment" });
  }
});

module.exports = router;
