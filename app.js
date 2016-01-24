//var edge = require('edge');
var express = require('express');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var hash = require('./pass').hash;
var bodyParser = require('body-parser');
var ffi = require('ffi');

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
app.use(cookieParser('shhhh, very secret'));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
app.use(session({
  secret: 'keyboard cat'
}));   


// Session-persisted message middleware                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
app.use(function(req, res, next){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
  var err = req.session.error                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
    , msg = req.session.success;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
  delete req.session.error;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  delete req.session.success;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  res.locals.message = '';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
  if (err) res.locals.message = '<p class="msg error">' + err + '</p>';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  if (msg) res.locals.message = '<p class="msg success">' + msg + '</p>';                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
});  

// dummy database                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
var users = {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  test: { name: 'test' }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
};                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
// when you create a user, generate a salt                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
// and hash the password ('foobar' is the pass here)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
hash('test', function(err, salt, hash){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  if (err) throw err;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  // store the salt & hash in the "db"                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  users.test.salt = salt;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  users.test.hash = hash.toString();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      
}); 

// Authenticate using our plain-object database of doom!                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
function authenticate(name, pass, fn) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
  if (!module.parent) console.log('authenticating %s:%s', name, pass);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  var user = users[name];                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
  // query the db for the given username                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
  if (!user) return fn(new Error('cannot find user'));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  // apply the same algorithm to the POSTed password, applying                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
  // the hash against the pass / salt, if there is a match we                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
  // found the user                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  hash(pass, user.salt, function(err, hash){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    if (err) return fn(err);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    if (hash.toString() == user.hash) return fn(null, user);                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    fn(new Error('invalid password'));                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  })                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    
}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
function restrict(req, res, next) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
  if (req.session.user) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    next();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
    req.session.error = 'Access denied!';                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
  }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     
} 

app.get('/login', function(req, res){
    res.render('login.ejs');
});

app.post('/login', function(req, res){   
  authenticate(req.body.email, req.body.password, function(err, user){                                                                                                                                                                                                                                                                                                                                                                                                                                                                          
    if (user) {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         
      // Regenerate session when signing in                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             
      // to prevent fixation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
      req.session.regenerate(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                
        // Store the user's primary key                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 
        // in the session store to be retrieved,                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        
        // or in this case the entire user object                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
        req.session.user = user;                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
        res.redirect('/');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           
      });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               
    } else {                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              
      res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            
    }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
  });                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   
});

app.get('/logout', function(req, res){
  req.session.destroy(function(){                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
    res.redirect('/login');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  
  }); 
});

app.get('/', restrict, function(req, res){
	/*
	api.func({
	    assemblyFile: 'CGPTruck.WebAPI.dll',
	    typeName: 'CGPTruck.WebAPI.BLL.BLLMissions',
	    methodName: 'GetMissionOfDriver(1)' // Func<object,Task<object>>
	}});
	*/
    res.render('index.ejs');
});

app.get('/vehicules', restrict, function(req, res){
    res.render('vehicules.ejs');
});

app.get('/establishments', restrict, function(req, res){
    res.render('establishments.ejs');
});

app.get('/users', restrict, function(req, res){
    res.render('users.ejs');
});

app.get('/missions', restrict, function(req, res){
    res.render('missions.ejs');
});
app.get('/addMission', restrict, function(req, res){
    res.render('addMission.ejs');
});
app.get('/voirMission', restrict, function(req, res){
    res.render('viewMission.ejs');
});

app.get('/profile', restrict, function(req, res){
    res.render('profile.ejs');
});

app.listen(app.get('port'), function() {
	console.log("Server is running on port " + 4000);
});