var mongoose = require('mongoose');
var url = 'mongodb://localhost/usr';
mongoose.Promise = global.Promise;
var db = mongoose.createConnection(url, function(err,res){
	if(err){
		console.log('Error connected: '+url+'-'+err);
	}else{
		console.log('Success connected:!');
	}
});

var UserSchema = new mongoose.Schema({
	id: Number,
	name: String,
	pass: String,
	x: Number,
	y: Number
},{collection: 'usrs'});

var MesgSchema = new mongoose.Schema({
	id: Number,
	name: String,
	time: Date,
	open: Number, //0:close 1:open
	x: Number,
	y: Number,
	dir: Number,
	theta: Number,
	r: Number,
	msg: String
},{collection: 'msg'});

exports.User = db.model('usrs',UserSchema);
exports.Mesg = db.model('msg',UserSchema);
