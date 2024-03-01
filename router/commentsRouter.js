const express = require("express");
const router = express.Router();
const db = require("../reddit-fake-db-exemp");

router.get("/show/:id", (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;

    const commentDetail = db.comments.get_byId(commentId, {
      withCreator: true,
      withVotes: true,
      withNestedComments: true,
      withCurrentVote: db.users.get_byUsername(username),
    });

    if (!commentDetail) {
      throw new Error("Comment not found");
    }

    const voteValue = Number(commentDetail.upvotes - commentDetail.downvotes);

    res.render("commentShow", {
      username,
      commentId,
      comment: commentDetail,
      commentVote: voteValue,
    });
  } catch (error) {
    res.render("error", { msg: "Error fetching comment" });
  }
});

router.post("/vote/:id/:votevalue", (req, res) => {
  // try {
  //   const user = req.session.user;
  //   const creator = db.users.get_byUsername(user);

  //   if (!creator) {
  //     throw new Error("User not found");
  //   }

  const username = req.session.user;
  const voter = db.users.get_byUsername(username);

  const commentId = req.params.id;
  const voteValue = req.params.votevalue;
  const comment = db.comments.get_byId(commentId);
  console.log({ voter });
  const currentVote = db.comments.get_vote({ comment, voter });
  if (currentVote) {
    if (currentVote.vote_value === Number(voteValue)) {
      db.comments.remove_vote({ comment, voter });
    } else {
      db.comments.set_vote({ comment, voter, vote_value: Number(voteValue) });
    }
  } else {
    db.comments.set_vote({ comment, voter, vote_value: Number(voteValue) });
  }
  const referer = req.header("Referer") || "/comments/show/" + commentId;
  res.redirect(referer);
});

router.post("/create/:id", (req, res) => {
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
    res.render("error", { msg: "Error creating comment" });
  }
});

router.get("/edit/:id", (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;
    const comment = db.comments.get_byFilter((comment) => comment.id === commentId);

    if (comment.length === 0) {
      throw new Error("Comment not found");
    }

    res.render("commentEdit", { username, commentId, comment });
  } catch (error) {
    res.render("error", { msg: "Error fetching comment for editing" });
  }
});

router.post("/edit/:id", (req, res) => {
  try {
    const commentId = req.params.id;
    const newCommentText = req.body.contents;
    const editComment = db.comments.update({ id: commentId, text: newCommentText });

    if (!editComment) {
      throw new Error("Comment not found");
    }

    res.redirect(`/comments/show/${editComment.id}`);
  } catch (error) {
    res.render("error", { msg: "Error editing comment" });
  }
});

router.get("/delete/:id", (req, res) => {
  try {
    const username = req.session.user;
    const commentId = req.params.id;
    res.render("commentDelete", { username, id: commentId });
  } catch (error) {
    res.render("error", { msg: "Error fetching comment for deletion" });
  }
});

router.post("/delete/:id", (req, res) => {
  try {
    const commentId = req.params.id;
    const comments = db.comments.get_byFilter((comment) => comment.id === commentId);

    if (comments.length === 0) {
      throw new Error("Comment not found");
    }

    const comment = comments[0];
    const deleteComment = db.comments.delete(comment.id);
    res.redirect(`/articles/show/${comment.article_id}`);
  } catch (error) {
    res.render("error", { msg: "Error deleting comment" });
  }
});

module.exports = router;
