var mongoose = require('mongoose');

//Connect to the database
mongoose.connect('mongodb://localhost/tdw');

mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

mongoose.connection.once('open', function() {
  console.log('Database connection succeeded');
});

var keywordSchema = mongoose.Schema({
  firstParameter : String,
  secondParameter : String,
  thirdParameter : String,
  user : Number,
  status : Boolean,
  pid : Number,
  created : Date
});

var tweetSchema = mongoose.Schema({
  tweet : {},
  keyword : String
});

var processesSchema = mongoose.Schema({
  address : String
});

var userSchema = mongoose.Schema({
  firstName : String,
  lastName : String,
  email : String,
  password : String
});

exports.Users = mongoose.model('Users', userSchema);
exports.Tweets = mongoose.model('Tweets', tweetSchema);
exports.Keywords = mongoose.model('Keywords', keywordSchema);
exports.Processes = mongoose.model('Processes', processesSchema);
exports.mongoose = mongoose;
