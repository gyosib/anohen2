var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var fs = require("fs");
var http = require('http');
var https = require('https');

var privateKey = fs.readFileSync('server.key','utf8');
var certificate = fs.readFileSync('server.crt','utf8');
var credentials = {key: privateKey, cert: certificate};

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

// teach directory
app.use('/plugin',express.static('plugin'));

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
httpServer.listen(3100);
httpsServer.listen(3200);

//var server = app.listen(3100);

// Socket IO
var io = require("socket.io")
	.listen(httpServer,{path:'/socket.io',log:false,origins:'*:*'});
//var io = require("socket.io").listen(server);
io.set('origins','*:*');
io.sockets.on('connection', function(socket){
	console.log("Listen:"+app.get('port'));
	socket.on("sendmsg",function(data){
		console.log("get message");
		//sending data
		var r = data.r;
		var dir = data.dir;
		var theta = data.theta;
		var x0 = data.x;
		var y0 = data.y;
		//Find
		Usr.find({},function(err,docs){
			for(var i=0;i<docs.length;i++){
				var dx = 90000*(docs[i].x-x0);
				var dy = 111000*(docs[i].y-y0);
				var theta_db = Math.atan(dy/dx);
				var r_db = dx/Math.cos(theta_db);
				console.log(r);
				console.log(theta);			
				console.log(dir);
				console.log(theta_db);
				console.log(r_db);
				if(
					r_db <= r && 
					theta_db >= (dir-theta/2) && 
					theta_db <= (dir+theta/2)
				){
					console.log(docs[i].name); //user data in range
					var Msg_foru = msgmode.model(docs[i].name,MsgSchema);
					var message = new Msg({
						id:0,date:new Date(),who:"administractor",msg:"test"
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
	});
	socket.on("loadmsg",function(data){
		console.log("loadmsg");
	    var Msg = msgmode.model(data.name,MsgSchema);
	    Msg.find({},function(err,docs){
		    if(err){
		    	console.log(err);
			}else{
				console.log(docs);
				io.sockets.emit("loadmsg",docs);
			}
		});
	});
});

module.exports = app;
