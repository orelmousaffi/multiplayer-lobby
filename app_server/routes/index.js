var express = require('express');
var mongoose = require('mongoose');
var passport = require('passport');

var LocalStrategy = require('passport-local').Strategy;
var User = mongoose.model('Users');
var router = express.Router();

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

var isAuthenticated = function(req, res, next) {
  if (req.user) {
    return next();
  }
  else {
    res.redirect('/login');
  }
}

/* GET home page. */
router.get('/', isAuthenticated, function(req, res) {
  res.render('index', {
    title: 'All Rooms',
    currentUser: req.user
  });
});

router.get('/chat', isAuthenticated, function(req, res) {
  res.render('chat', {
    title: 'Chat Room - ' + req.user.username
  });
});

router.get('/login', function(req, res) {
  res.render('login', { title: 'Login page'});
});

module.exports = router;
