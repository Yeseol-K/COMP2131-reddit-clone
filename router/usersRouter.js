const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');

const db = require('../reddit-fake-db-pass');

router.get('/login', (req, res) => {
  const username = req.session.user;
  // console.log('username:', username);
  res.render('login', {username: username});
});

router.post('/login', (req, res) => {
  const username = req.body.title;
  const password = req.body.password;

  const user = db.users.get_byUsername(username);

  if (!user || user.username !== username) {
    return res.render('error', { msg: 'Username does not exist' });
  }

  bcrypt.compare(password, user.password_hash, (err, result) => {
    if (err) {
      return res.render('error', { msg: 'An error during login' });
    }

    if (result === true) {
      req.session.user = user.username;
      res.redirect('/');
    } else {
      res.render('error', { msg: 'Password is not correct' });
    }
  });
});

router.post('/logout', (req, res) => {
  // console.log('user', req.session);
  req.session.user = null;
  res.redirect('/');
});
    
router.get('/register', (req, res) => {
  const newUser = req.body.title;
  const newPassword = req.body.password;
  res.render('register', { username: newUser });
});

router.post('/register', (req, res) => {
  try {
    const newUser = req.body.title;
    const newPassword = req.body.password;
    const password_hash = bcrypt.hashSync(newPassword, 10);

    const user = db.users.create({ username: newUser, password_hash: password_hash });
    // console.log(user);

    res.redirect('/');
  } catch (err) {
    console.error(err);
    res.render('error', { msg: 'Registration failed' });
  }
});


router.get('/profile/:id', (req, res) => {
  const user = req.session.user;
  const username = req.params.id;
  const userInfo = db.users.get_byUsername(username);
  const profileArticle = db.articles.get_byFilter(article => article.creator_id === userInfo.id);
  const profileComment = db.comments.get_byFilter(comment => comment.creator_id === userInfo.id);
  // console.log(profileArticle);
  // console.log(profileComment);

  res.render('profile', { username: username, user: user, articles: profileArticle, comments: profileComment });
});

module.exports = router;