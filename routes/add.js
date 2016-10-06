var express = require('express');
var router = express.Router();
var model = require('../model.js');
var User = model.User;

router.post('/',function(req,res){
	var newUser = new User(
	{
		id:0,
		name:req.body.name,
		pass:req.body.pass,
		x:1e-7,
		y:1e-7
	}
	);
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
