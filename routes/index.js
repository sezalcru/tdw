var express = require('express');
var router = express.Router();
var db = require('../database');
var http = require('http');
var passport = require('passport');

/**
 * Enforce route security
 */
function auth(req, res, next){
  if(req.isAuthenticated()){
    next();
  } else {
    res.redirect('/login');
  }
}

function getURL(ip){
  return 'http://' + ip;
}


router.get('/', function(req, res, next){
  res.redirect('/keywords');
});

/**
 * Render login page
 */
router.get('/login', function(req, res, next){
  res.render('login');  
});

/**
 * Login the user
 */
router.post('/login', passport.authenticate('local'), function(req, res){
  res.redirect('/keywords');
});

/**
 * Logout the user
 */
router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/login');
});

/**
* Get keywords
**/
router.get('/keywords',  auth, function(req, res, next){
  db.Keywords.find({}, {}, {limit : 50}, function(err, keywords){
    if(!err){
      res.render('index', {title : 'Current Searches', keywords : keywords, user : req.user});
    }
  });
});

router.get('/keywords/new', auth, function(req, res, next){
  res.render('new', {user : req.user});
});

router.get('/keywords/:id', auth, function(req, res, next) {
  var data = {}, stats = { languages : [], langCount : []};
  db.Keywords.findOne({_id : req.params.id}, function(err, keyword){
    db.Tweets.find({keyword : req.params.id}, function(err, tweets){
        data.title = 'Active Search';
        data.keyword = keyword;
        data.tweets = tweets;
        res.render('keyword', { data : data, user : req.user});
    });
  });
});

/**
* Create keyword combinations
**/
router.post('/keywords', auth, function(req, res, next){

    db.Keywords.create({
      parameter : req.body.parameter || '',
      user : req.user.id,
      status : true,
      created : Date.now(),
      sunday : 0,
      monday : 0,
      tuesday : 0,
      wednesday : 0,
      thursday : 0,
      friday : 0,
      saturday : 0,
      cluster : req.body.cluster
    }, function(err, keyword){
      console.log(err);
      if(!err){
        var url = getURL(keyword.cluster);
        console.log(url);
        http.get(url + '/start/' + keyword._id, (response) => {
          res.redirect('/keywords');
        });
      }
    });

});

router.put('/keywords/:id', auth, function(req, res, next){
   db.Keywords.findOne({_id : req.params.id}, function(err, keyword){
     var url = getURL(keyword.cluster);
     if(req.body.action === 'start'){
        http.get(url + '/restart/' + req.params.id, () => {
          keyword.status = true;
          keyword.save(function(error){
            if(!error){
             res.sendStatus(200); 
            }
          });
        });
      } else if(req.body.action === 'stop'){
        http.get(url + '/stop/' + req.params.id, () => {
          keyword.status = false;
          keyword.save(function(error){
            if(!error){
             res.sendStatus(200); 
            }
          });
        });
      } else {
        res.sendStatus(400);
      }
   });
});


/**
 * Register functions
 */
router.get('/register', function(req, res) {
    res.render('register', { });
});

router.post('/register', function(req, res) {
    db.Users.register(new db.Users({ username : req.body.username }), req.body.password, function(err, account) {
        if (err) {
          console.log(err);
            return res.render('register', { account : account });
        }

        passport.authenticate('local')(req, res, function () {
            res.redirect('/keywords');
        });
    });
});



module.exports = router;
