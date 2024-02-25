const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const db = require('../reddit-fake-db-exemp');

router.get('/login', (req, res) => {
  try {
    const username = req.session.user;
    res.render('login', { username });
  } catch (error) {
    res.render('error', { msg: "Error rendering login page" });
  }
});

router.post('/login', (req, res) => {
  try {
    const username = req.body.title;
    const password = req.body.password;

    const user = db.users.get_byUsername(username);

    if (!user || user.username !== username) {
      throw new Error('Username does not exist');
    }

    bcrypt.compare(password, user.password_hash, (err, result) => {
      if (err) {
        throw new Error('An error occurred during login');
      }

      if (result === true) {
        req.session.user = user.username;
        res.redirect('/');
      } else {
        res.render('error',{msg: 'Password is not correct'});
      }
    });
  } catch (error) {
    res.render('error', { msg: "Error during login" });
  }
});

router.post('/logout', (req, res) => {
  try {
    req.session.user = null;
    res.redirect('/');
  } catch (error) {
    res.render('error', { msg: "Error during logout" });
  }
});

router.get('/register', (req, res) => {
  try {
    const newUser = req.body.title;
    const newPassword = req.body.password;
    res.render('register', { username: newUser });
  } catch (error) {
    res.render('error', { msg: "Error rendering registration page" });
  }
});

router.post('/register', (req, res) => {
  try {
    const newUser = req.body.title;
    const newPassword = req.body.password;
    const password_hash = bcrypt.hashSync(newPassword, 10);

    const user = db.users.create({ username: newUser, password_hash });

    res.redirect('/users/login');
  } catch (error) {
    console.error(error);
    res.render('error', { msg: "User already exists" });
  }
});

router.get('/profile/:id', (req, res) => {
  try {
    const user = req.session.user;
    const username = req.params.id;
    const userInfo = db.users.get_byUsername(username);
    const profileArticle = db.articles.get_byFilter(article => article.creator_id === userInfo.id);
    const profileComment = db.comments.get_byFilter(comment => comment.creator_id === userInfo.id);

    res.render('profile', { username, user, articles: profileArticle, comments: profileComment });
  } catch (error) {
    res.render('error', { msg: "Error rendering user profile" });
  }
});

module.exports = router;
