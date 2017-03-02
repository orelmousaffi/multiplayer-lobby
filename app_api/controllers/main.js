//Include all required modules
var mongoose = require('mongoose');
var passport = require('passport');

//Include the Users data model
var Users = mongoose.model('Users');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
}

var renderPage = function (req, res, dataObj) {
  res.status(dataObj.status);
  res.render(dataObj.page, {
    title : dataObj.title
  });
}

module.exports.apiHome = function(req, res) {
  renderPage(req, res, {
    status: 201,
    title: "All Rooms",
    page: "index"
  });
}

module.exports.createUser = function(req, res) {

  Users.register(new Users({
    username: "sean@gmail.com"
  }), "test123", function(error, user) {
    if (error) {
      sendJSONresponse(res, 404, error);
    }
    sendJSONresponse(res, 201, user);
  });
};

module.exports.loginUser = function(req, res) {
  passport.authenticate('local')(req, res, function () {
    res.redirect('/');
  });
}
