var express = require('express'),
	app = express(),
	mongoose = require('mongoose'),
	passport = require('passport'),
	bodyParser = require('body-parser'),
	localStrategy = require('passport-local'),
	User = require('./models/user'),
	passportLocalMongoose = require('passport-local-mongoose');

// CONFIG
app.use(
	require('express-session')({
		secret: 'decode the sessions',
		resave: false,
		saveUninitialized: false
	})
);
app.set('view engine', 'ejs');
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({ extended: true }));
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// DB CONNECTION
mongoose
	.connect('mongodb://localhost/auth_demo', {
		useUnifiedTopology: true,
		useNewUrlParser: true
	})
	.then(() => console.log('DB Connected!'))
	.catch((err) => {
		console.log('DB Connection Error: ${err.message}');
	});

mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);

// ==================================
// ROUTES
// ==================================

app.get('/', (req, res) => {
	res.render('home');
});

app.get('/secret', isLoggedIn, (req, res) => {
	res.render('secret');
});

// SHOW LOGIN FORM
app.get('/login', (req, res) => {
	res.render('login');
});

// USER LOGIN
app.post(
	'/login',
	passport.authenticate('local', {
		successRedirect: '/secret',
		failureRedirect: 'login'
	}),
	(req, res) => {}
);

// SHOW SIGN-UP FORM
app.get('/sign-up', (req, res) => {
	res.render('sign-up');
});

// USER SIGN-UP
app.post('/sign-up', (req, res) => {
	console.log(req.body);
	var username = req.body.username;
	var password = req.body.password;
	User.register(new User({ username: username }), password, (err, user) => {
		if (err) {
			console.log(err);
			res.render('home');
		} else {
			// Log user in
			passport.authenticate('local')(req, res, () => {
				res.redirect('/secret');
			});
		}
	});
});

// USER LOGOUT
app.get('/logout', (req, res) => {
	req.logout();
	console.log('You were logged out.');
	res.redirect('/');
});

function isLoggedIn(req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/login');
}

// SERVER LISTENER
app.listen(3000, () => {
	console.log('Server started...');
});
