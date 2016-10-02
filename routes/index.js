var express = require('express');
var router = express.Router();

var loginCheck = function(req,res,next){
	if(req.session.user){
		next();
	}else{
		res.redirect('login');
	}
};

/* GET home page. */
router.get('/', loginCheck,function(req, res, next) {
  res.render('index', { user:req.session.user });
});

router.post('/',function(req,res,next){
	res.render('get_gps');
});

module.exports = router;
