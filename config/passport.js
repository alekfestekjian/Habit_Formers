var LocalStrategy = require('passport-local').Strategy;
var User = require('../app/models/user');

module.exports = function(passport) {
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	passport.use('signup', new LocalStrategy({
		usernameField : 'email',
		passwordField : 'password',
		passReqToCallback: true
	},
	function(req,email,password , done) {
		User.findOne({'email' : email}, function(err, user) {
			//name
			if(err){
				return done(err);
			}
			if(user) {
				return done(null, false);
			} else {
				var newUser = new User();
				// newUser.local.ema = name;
				// newUser.local.email = email;
				// newUser.local.name = req.body.name
				// newUser.local.phone = req.body.phone
				// newUser.local.password = newUser.generateHash(password);
				newUser.email = email;
				newUser.name = req.body.name
				newUser.phone = req.body.phone
				newUser.password = newUser.generateHash(password);
				newUser.save(function(err) {
					if(err)
						throw err;
					return done(null, newUser);
				});
			}

		});
	}));

	passport.use('login', new LocalStrategy({
		usernameField: 'email',
		passwordField: 'password',
	},
	function(email, password, done) {
		User.findOne({'email': email}, function(err, user) {
			if(err)
				return done(err);
			if(!user)
				return done(null, false);
			if(!user.validPassword(password))
				return done(null, false);
			return done(null, user);

		});
	}));

};
