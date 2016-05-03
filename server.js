// Get the packages we need
var express = require('express');

var mongoose = require('mongoose');
var User = require('./app/models/user');
var Habit = require('./app/models/habit');
var Badge = require('./app/models/badge');
var bodyParser = require('body-parser');
var router = express.Router();
//adding passport stuff
var mongoose = require('mongoose');
var passport = require('passport');

var morgan = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var configDB = require('./config/database.js');

// mongoose.connect('mongodb://test:test@ds019471.mlab.com:19471/habitformers');
mongoose.connect('mongodb://habit:formers498@ds013221.mlab.com:13221/habit-formers');
require('./config/passport')(passport);

// Create our Express application
var app = express();

// Use environment defined port or 4000
var port = process.env.PORT || 4000;


// Use the body-parser package in our application
app.use(bodyParser.urlencoded({
	extended: true
}));

// this does something?
app.use(bodyParser.json());
//More passport stuff
app.use(morgan('dev'));
app.use(cookieParser());
app.use(bodyParser());

app.use(session({ secret: 'passport demo' }));
app.use(express.static(__dirname + '/frontend/public'));

//Use if we move to one repo
// app.use(express.static(__dirname+ '/web/public'));
app.use(passport.initialize());
app.use(passport.session());
// preflight stuffs from https://gist.github.com/cuppster/2344435
// app.use(express.methodOverride());

// ## CORS middleware
//
// see: http://stackoverflow.com/questions/7067966/how-to-allow-cors-in-express-nodejs
var allowCrossDomain = function(req, res, next) {
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
	res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

// intercept OPTIONS method
if ('OPTIONS' == req.method) {
	res.sendStatus(200);
}
else {
	next();
}
};
app.use(allowCrossDomain);

/*
ROUTES
*/
// All our routes will start with /api
app.use('/api', router);

var homeRoute = router.route('/');
var usersRoute = router.route('/users');
var userRoute = router.route('/users/:id');
var habitsRoute = router.route('/habits');
var habitRoute = router.route('/habits/:id');
var badgeRoute = router.route('/badges');
var badgeIdRoute = router.route('/badges/:id');


homeRoute.get(function(req, res) {
	res.status(404).json({
		message : 'Nothing here. Go to ./users or ./habits to play with the API.',
		data : []
	});
});

usersRoute.get(function(req, res) {
	var query = User.find({});
	query.exec(function(err, users) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else {
			res.json({"message" : "OK", "data" : users});
			return;
		}
	});
});

usersRoute.post(function(req, res) {

	var name = req.body.name ? req.body.name : "";
	var email = req.body.email ? req.body.email : "";
	var password = req.body.password ? req.body.password : "";
	var phone = req.body.phone ? req.body.phone : "";
	var user = new User({
		name: name,
		email: email,
		password: password,
		phone: phone
	});
	user.save(function(err, user) {
		if(err && err.code == 11000) {
			res.status(500).json({"message" : 'Error: That email is already in use.', "data" : []});
			return;
		}
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else {
			res.status(201).json({"message": "User created", "data" : user});
			return;
		}
	});

});

habitsRoute.get(function(req, res) {
	var query = Habit.find({});
	var where = "";
	if(req.query.where) {
		try {
			where = eval("("+ req.query.where + ")");
		} catch(e) {
			console.error("Can't parse parameter.");
			res.status(500).json({"message" : 'Error: Your query syntax is invalid.', "data" : []});
			return;
		}
	}
	if(where) query.where(where);
	query.exec(function(err, habits) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else {
			res.json({"message" : "OK", "data" : habits});
			return;
		}
	});
});

habitsRoute.post(function(req, res) {
	if(!req.body.name) {
		res.status(500).json({"message" : 'Error: A name is required.', "data" : []});
		return;
	}
	var name = req.body.name;
	var userId = req.body.userId ? req.body.userId : "";
	var repeat = {
		option: req.body.repeat.option ? req.body.repeat.option : 0,
		days: req.body.repeat.days ? req.body.repeat.days : [],
		interval: req.body.repeat.interval ? req.body.repeat.interval : 1
	};
	var complete_days = req.body.complete_days ? req.body.complete_days : []; // {date, completed}
	var start_date = req.body.start_date ? req.body.start_date : "";
	var end_date = req.body.end_date ? req.body.end_date : "";
	var note = req.body.note ? req.body.note : "";

	var habit = new Habit({
		name: name,
		userId: userId,
		repeat: repeat,
		complete_days: complete_days,
		start_date: start_date,
		end_date: end_date,
		note: note
	});

	habit.save(function(err, habit) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else {
			res.status(201).json({"message": "Habit created", "data" : habit});
			return;
		}
	});
});

usersRoute.options(function(req, res) {
	res.writeHead(200);
	res.end();
});

habitsRoute.options(function(req, res) {
	res.writeHead(200);
	res.end();
});

userRoute.get(function(req, res) {
	var userID = req.params.id;
	if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: User not found.", data : []});
		return;
	}

	User.findById(userID, function(err, user) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(user) {
			res.json({"message" : "OK", "data" : user});
			return;
		}
		else {
			res.status(404).json({"message" : "Error: User not found.", data : []});
			return;
		}
	});
});

userRoute.put(function(req, res) {
	var userID = req.params.id;
	if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: User not found.", data : []});
		return;
	}

	User.findById(userID, function(err, user) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(user) {

			user.name = req.body.name ? req.body.name : '';
			user.email = req.body.email ? req.body.email : '';
			user.password = req.body.password ? req.body.password : "";
			user.phone = req.body.phone ? req.body.phone : "";

			user.save(function(err, user) {
				if(err && err.code == 11000){
					res.status(500).json({"message" : 'ValidationError: That email is already in use.', "data" : []});
					return;
				}
				if(err) {
					res.status(500).json({"message" : '' + err, "data" : []});
					return;
				}
				else {
					res.status(200).json({"message": "User updated", "data" : user});
					return;
				}
			});

		}
		else {
			res.status(404).json({"message" : "Error: User not found.", data : []});
			return;
		}
	});
});

userRoute.delete(function(req, res) {
	var userID = req.params.id;

	if (!userID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: User not found.", data : []});
		return;
	}

	User.findByIdAndRemove(userID, function(err, user) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(user) {
			res.json({"message" : "User deleted.", "data" : []});
			return;
		}
		else {
			res.status(404).json({"message" : "Error: User not found.", data : []});
			return;
		}
	});
});

habitRoute.get(function(req, res) {
	var habitID = req.params.id;
	if (!habitID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: Habit not found.", data : []});
		return;
	}

	Habit.findById(habitID, function(err, habit) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(habit) {
			res.json({"message" : "OK", "data" : habit});
			return;
		}
		else {
			res.status(404).json({"message" : "Error: Habit not found.", data : []});
			return;
		}
	});
});

habitRoute.put(function(req, res) {
	var habitID = req.params.id;
	if (!habitID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: Habit not found.", data : []});
		return;
	}

	Habit.findById(habitID, function(err, habit) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(habit) {

			habit.name = req.body.name ? req.body.name : '';
			habit.userId = req.body.userId ? req.body.userId : '';
			habit.repeat = {
				option: req.body.repeat.option ? req.body.repeat.option : 0,
				days: req.body.repeat.days ? req.body.repeat.days : [],
				interval: req.body.repeat.interval ? req.body.repeat.interval : 1
			};
			habit.complete_days = req.body.complete_days ? req.body.complete_days : []; // {date, completed}
			habit.start_date = req.body.start_date ? req.body.start_date : "";
			habit.end_date = req.body.end_date ? req.body.end_date : "";
			habit.note = req.body.note ? req.body.note : "";

			habit.save(function(err, habit) {
				if(err) {
					res.status(500).json({"message" : '' + err, "data" : []});
					return;
				}
				else {
					res.status(200).json({"message": "Habit updated", "data" : habit});
					return;
				}
			});

		}
		else {
			res.status(404).json({"message" : "Error: Habit not found.", data : []});
			return;
		}
	});
});

habitRoute.delete(function(req, res) {
	var habitID = req.params.id;

	if (!habitID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: Habit not found.", data : []});
		return;
	}

	Habit.findByIdAndRemove(habitID, function(err, habit) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(habit) {
			res.json({"message" : "Habit deleted.", "data" : []});
			return;
		}
		else {
			res.status(404).json({"message" : "Error: Habit not found.", data : []});
			return;
		}
	});
});

badgeRoute.get(function(req, res) {
    var queryOptions = {
        where : req.query
    };
    Badge.find(queryOptions.where)
     .exec(function(err, docs) {
        if (err) {
            return res.status(500).json({ message: 'Error: Unable to retrieve results from database.'}); 
        }
        else {
            var dataObj = docs;
            return res.status(200).json({ message: 'Retrieved Data', data: dataObj });
        }
    });
});

badgeRoute.post(function(req, res) {
	var badge = new Badge({
		name: req.body.name,
		description: req.body.description,
	    requiredValue: req.body.requiredValue,
	    completionBadge: req.body.completionBadge
	});

	badge.save(function(err, badge) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else {
			res.status(201).json({"message": "Badge created", "data" : badge});
			return;
		}
	});	
})

badgeIdRoute.delete(function(req, res) {
	var badgeID = req.params.id;

	if (!badgeID.match(/^[0-9a-fA-F]{24}$/)) {
		res.status(404).json({"message" : "Error: Badge not found.", data : []});
		return;
	}

	Badge.findByIdAndRemove(badgeID, function(err, badge) {
		if(err) {
			res.status(500).json({"message" : '' + err, "data" : []});
			return;
		}
		else if(badge) {
			res.json({"message" : "Badge deleted.", "data" : []});
			return;
		}
		else {
			res.status(404).json({"message" : "Error: Badge not found.", data : []});
			return;
		}
	});
})

require('./app/routes.js')(app, passport);

app.listen(port);
console.log('Server running on port ' + port);
