module.exports = function(app, passport) {

	app.post('/signup', passport.authenticate('signup',{successRedirect: '/#/monthly',failureRedirect: '/#/signup' }), function(req, res) {
		res.redirect('/#/monthly');
	});

	app.post('/login', passport.authenticate('login',{successRedirect: '/#/monthly',failureRedirect: '/#/login' }), function(req, res) {
		res.redirect('/#/monthly');
	});

	app.get('/profile', isLoggedIn, function(req, res) {
		res.json({
			user: req.user
		});
	});

	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/#/login');
	});

	function isLoggedIn(req, res, next) {
		if(req.isAuthenticated())
			return next();
		else{
			res.redirect('/#/login');
        }
		res.json({
			error: "User not logged in"
		});
	}

};
