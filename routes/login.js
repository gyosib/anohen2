var express = require('express');
var router = express.Router();
var model = require('../model.js');
var User = model.User;

router.get('/',function(req,res){
	res.render('login');
});

router.post('/',function(req,res){
	var usrname = req.body.name;
	var usrpass = req.body.pass;
	var query = {
		name: usrname,
		pass: usrpass
	};
	console.log(query);
	User.find(query,function(err,data){
		if(err){
			console.log(err);
		}
		console.log(data);
		console.log(data.length);
		if(data.length === 0){
			res.render('login');
		}else{
			req.session.user = usrname;
			res.redirect('/');
		}
	});
});

module.exports = router;
