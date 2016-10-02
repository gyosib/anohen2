var express = require('express');
var router = express.Router();
var model = require('../model.js');
var User = model.User;

router.post('/',function(req,res){
	var newUser = new User(req.body);
	console.log(req.body);
	newUser.save(function(err){
		if(err){
			console.log(err);
			res.redirect('back');
		}else{
			res.redirect('/');
		}
	});
});

module.exports = router;
