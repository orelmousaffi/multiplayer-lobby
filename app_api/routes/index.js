//Initialize Express Router
var express = require('express');
var router = express.Router();

//Define Controllers
var apiCtrl = require('../controllers/main');

//GET Requests
router.get('/', apiCtrl.apiHome);
router.get('/create', apiCtrl.createUser);

//POST Requests
router.post('/connectToFriend', apiCtrl.connectToFriend);
router.post('/login', apiCtrl.loginUser);

module.exports = router;
