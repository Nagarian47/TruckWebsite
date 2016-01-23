//var edge = require('edge');
var express = require('express');
var bodyParser = require('body-parser');

var app = express();

app.set('port', (process.env.PORT || 4000));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.get('/', function(req, res){
	/*
	api.func({
	    assemblyFile: 'CGPTruck.WebAPI.dll',
	    typeName: 'CGPTruck.WebAPI.BLL.BLLMissions',
	    methodName: 'GetMissionOfDriver(1)' // Func<object,Task<object>>
	}});
	*/
    res.render('index.ejs');
});

app.get('/login', function(req, res){
    res.render('login.ejs');
});

app.get('/vehicules', function(req, res){
    res.render('vehicules.ejs');
});

app.get('/establishments', function(req, res){
    res.render('establishments.ejs');
});

app.get('/users', function(req, res){
    res.render('users.ejs');
});

app.get('/missions', function(req, res){
    res.render('missions.ejs');
});
app.get('/voirMission', function(req, res){
    res.render('viewMission.ejs');
});

app.get('/profile', function(req, res){
    res.render('profile.ejs');
});

app.listen(app.get('port'), function() {
	console.log("Server is running on port " + 4000);
});