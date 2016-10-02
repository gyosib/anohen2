var express = require('express');
var router = express.Router();
var model = require('../model.js');
var User = model.User;

/*router.get('/',function(req,res){
	res.render('get_gps');
});*/

router.post('/',function(req,res){
	res.render('get_gps');
});

module.exports = router;
