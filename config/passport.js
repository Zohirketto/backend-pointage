// load all the things we need
const LocalStrategy   = require('passport-local').Strategy;
const passport = require('passport');
// load up the user model
var User            = require('../models/User');

// expose this function to our app using module.exports


  // Save user object into the session

  passport.serializeUser(function (user, done) {
    console.log("serialize")
    // If user doesn't exist
    if (!user) {

      return done(null, false);

    }
    // If everything all right, store object into the session
    return done(null, user._id);

  });

// Restore user object from the session

passport.deserializeUser(function (id, done) {
  console.log("deserialize")
  User.findById(id, function (err, user) {
    // If technical error occurs (such as loss connection with database)
    if (err) {
      return done(err);
    }
    // If user doesn't exist
    if (!user) {
      return done(null, false);
    }
    // If everything all right, the user will be authenticated
    return done(null, user);
  });
});

	passport.use('local-login', new LocalStrategy(
	  function(username, password, done) {
	    User.findOne({
	      username: username.toLowerCase()
	    }, function(err, user) {
	      // if there are any errors, return the error before anything else
           if (err)
               return done(err);

           // if no user is found, return the message
           if (!user)
               return done(null, false);

           // if the user is found but the password is wrong
           if (!user.validPassword(password))
               return done(null, false);
           // all is well, return successful user
           return done(null, user);
	    });
	  }
	));

module.exports = passport
