var express = require('express');
var path = require('path');
//var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var fs = require("fs");
var http = require('http');
var https = require('https');
var mongoose_usr = require('mongoose');
var mongoose_msg = require('mongoose');
var mongoose_fri = require('mongoose');

var privateKey = fs.readFileSync('server.key','utf8');
var certificate = fs.readFileSync('server.crt','utf8');
var credentials = {key: privateKey, cert: certificate};

//DetaBase ====================
var UsrSchema = new mongoose_usr.Schema({
	id:Number,
	name:String,
	pass:String,
	x:Number,
	y:Number,
    endpoint:String
});
var MsgSchema = new mongoose_msg.Schema({
	day:Date,
	name:String,
	open:Number,
	msg:String,
	x:Number,
	y:Number
	/*id:Number,
	date:Date,
	who:String,
	msg:String*/
	
});
var FriSchema = new mongoose_fri.Schema({
	id:Number,
	name:String	
});

mongoose_usr.Promise = global.Promise;
mongoose_msg.Promise = global.Promise;
mongoose_fri.Promise = global.Promise;
var usrmode = mongoose_usr.createConnection("mongodb://"+"localhost"+":27017/usr",function(err){
	if(err){
		console.log(err);
	}else{
		console.log('connection success!');
	}
});
var msgmode = mongoose_msg.createConnection("mongodb://"+"localhost"+":27017/msg",function(err){
	if(err){
		console.log(err);
	}else{
		console.log('connection success!');
	}
});
var frimode = mongoose_fri.createConnection("mongodb://"+"localhost"+":27017/fri",function(err){
	if(err){
		console.log(err);
	}else{
		console.log('connection success!');
	}
});

//var Usr = usrmode.model('usr',UsrSchema);
//var Msg = msgmode.model('test_user',MsgSchema);

//=================== DataBase 

//BasicSetting ====================

var app = express();

app.use(session({
	secret: 'secret',
	store: new MongoStore({
		db: 'usr',
		host: 'localhost',
		url: 'mongodb://localhost:27017/usr',
		clear_interval: 60*60
	}),
	cookie: {
		httpOnly :true,
		maxAge: 60 * 60* 1000
	}
}));

var routes = require('./routes/index');
var users = require('./routes/users');
var login = require('./routes/login');
var add = require('./routes/add');
var logout = require('./routes/logout');
var get_gps = require('./routes/get_gps');
var send = require('./routes/send');
var box = require('./routes/box');
var friend = require('./routes/friend');
//var service = require('./service-worker');

// teach directory
app.use('/plugin',express.static('plugin'));
app.use('/css',express.static('css'));
app.use('/image',express.static('image'));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.use('/login', login);
app.use('/add', add);
app.use('/logout', logout);
app.use('/get_gps', get_gps);
app.use('/send', send);
app.use('/box', box);
app.use('/friend', friend);
//app.use('/service-worker', service);

app.set("ipaddr","127.0.0.1");
app.set("port",3100);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  console.log(err);
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

app.use(function(req,res,next){
	/*res.setHeader('Access-Control-Allow-Origin','*:*');
	res.setHeader(
		'Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,PATCH,DELETE');
	res.setHeader(
		'Access-Control-Allow-Headers',
		'Origin,Content-Type,X-Requested-With,x-request-metadata,Accept'
		);
	res.setHeader('Access-Control-Allow-Credentials',true);*/
	res.header('Access-Control-Allow-Origin','*:*');
	res.header(
		'Access-Control-Allow-Methods','GET,POST,OPTIONS,PUT,PATCH,DELETE');
	res.header(
		'Access-Control-Allow-Headers',
		'Origin,Content-Type,X-Requested-With,x-request-metadata,Accept'
		);
	res.header('Access-Control-Allow-Credentials',true);
	next();
});

// Create Server(http or https)
var httpServer = http.createServer(app);
var httpsServer = https.createServer(credentials,app);
httpServer.listen(3100,function(){
//	process.setuid("medjed");
});
httpsServer.listen(3200,function(){
//	process.setuid("medjed");
});

//var server = app.listen(3100);

//=================== BasicSetting

//IO ====================

// Socket IO
var io = require("socket.io")
	.listen(httpsServer,{path:'/socket.io',log:false,origins:'*:*'});
//var io = require("socket.io").listen(server);
io.set('origins','*:*');

io.sockets.on('connection', function(socket){
	console.log("Listen:"+app.get('port'));
	//mongoose_usr.connect();
	//mongoose_msg.connect();
	socket.on("loadmsg",function(data){
	    console.log("loadmsg");
	    console.log(data.name);
	    var Msg = msgmode.model(data.name,MsgSchema);
	    Msg.find({},function(err,docs){
		console.log("finding");
	        if(err){
	        	console.log(err);
	       	}else{
			console.log(docs);
			io.sockets.emit("loadmsg",docs);
			}
		});
	});
	socket.on("searchfriend",function(data){
		console.log("searchfriend");
		var r = 5;
		var dir = 0;
		var theta = 360;
		var x0 = data.x;
		var y0 = data.y;
		//Find
		var Usr = usrmode.model('usr',UsrSchema);
		Usr.find({},function(err,docs){
			console.log("Hello");
			for(var i=0;i<docs.length;i++){
				var dx = 90000*(docs[i].x-x0);
				var dy = 111000*(docs[i].y-y0);
				var theta_db = Math.atan(dy/dx);
				var r_db = dx/Math.cos(theta_db);
				if(
					r_db <= r && 
					theta_db >= (dir-theta/2) && 
					theta_db <= (dir+theta/2)
				){
					console.log(docs[i].name); //user data in range
					io.sockets.emit("searchfriend",docs[i]);
				}	
			}
		});
		console.log("finish");
	});
	socket.on("addfriend",function(data){
		console.log("addfriend");
		var Usr = usrmode.model('usr',UsrSchema);
		console.log("Hello");
		var Fri = frimode.model(data.myname,FriSchema);
		var myfriend = new Fri({
			id:0,name:data.name
		});
		Fri.find({id:0},function(err,data){
			if(!err){
				if(data.length == 0){
					myfriend.save(function(err){
						if(err) { 
							console.log(err);
						}else{
							console.log('success send');
						}
					});
				}
			}
		});
		console.log("finish");
	});
	socket.on("update",function(data){
		console.log("update");
		var Usr = usrmode.model('usr',UsrSchema);
		console.log("Hello");
		Usr.update({name:data.name},{$set:{x:data.x, y:data.y,endpoint:endpoint}},
		function(err){
			if(err) throw err;
		});;
	});
	socket.on("disconnect",function(){
		console.log("disconnect!");
		/*mongoose_usr.disconnect();
		mongoose_msg.disconnect();*/
	});
});

// ==================== IO

// IO for Map====================
var io_map = require("socket.io")
	.listen(httpServer,{path:'/socket.io',log:false,origins:'*:*'});
io_map.set('origins','*:*');
io_map.sockets.on('connection', function(socket){
	socket.on("sendmsg",function(data){
		console.log("get message");
		//console.log(Usr);
		//sending data
		var r = data.r;
		var dir = data.dir;
		var theta = data.theta;
		var x0 = data.x;
		var y0 = data.y;
		console.log({"r":r,"dir":dir,"theta":theta,"x0":x0,"y0":y0});
		//Find
		var Usr = usrmode.model('usr',UsrSchema);
		Usr.find({},function(err,docs){
			console.log("Hello");
			for(var i=0;i<docs.length;i++){
				var dx = 90000*(docs[i].x-x0);
				var dy = 111000*(docs[i].y-y0);
				var theta_db = Math.abs(Math.atan(dy/dx));
				var r_db = Math.abs(dx/Math.cos(theta_db));
				console.log(r);
				console.log(theta);			
				console.log(dir);
                console.log("-----");
                console.log(theta_db);
				console.log(r_db);
				if(
					r_db <= r && 
					theta_db <= (theta)
				){
					console.log(docs[i].name); //user data in range
					var Msg = msgmode.model(docs[i].name,MsgSchema);
                    var headers = {
                        'Authorization': 'key=AIzaSyCrEo83lubM6YQlcVaRdSkrXktmXDMz1Tos',
                        'Content-Type': "application/json"
                    }
                    var option = {
                        url: 'https://android.googleapis.com/gcm/send',
                        methid: 'POST',
                        headers: headers,
                        json: true,
                        form: {'registration_ids':[docs[i].endpoint]}
                    }

                    request(option, function(error,response,body){
                    
                    })
					var message = new Msg({
						day:new Date(),name:data.name,open:0,msg:data.msg,x:data.x,y:data.y
					});
					message.save(function(err){
						if(err) { 
							console.log(err);
						}else{
							console.log('success send');
						}
					});
				}	
			}
		});
		console.log("finish");
	});
});

// ==================== IO for Map
process.on('SIGNAL',function(){
	mongoose_usr.disconnect();
	mongoose_msg.disconnect();
});

module.exports = app;
