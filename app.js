const express = require('express');
const path = require('path');
const expbs = require('express-handlebars');
const handlebars = require('handlebars');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');

const restaurants = require('./routes/restaurantRoutes');


const app = express();
const port = 3000;

// passport config
require('./config/passport-setup')(passport);

app.engine('handlebars', expbs.engine({
	defaultView: "main",
	layoutsDir: path.join(__dirname, '/views/layouts'),
	partialsDir: path.join(__dirname, '/views/partials')
}));

// middleware
app.set('view engine', 'handlebars');

app.use(express.static('public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

// express session middleware
app.use(session({
	secret: 'secretsan',
	resave: false,
	saveUninitialized: true
}))

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// flash
app.use(flash());

// global vars
app.use((req, res, next) => {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	next();
})

app.listen(3000, () => {
	console.log("listening to requests at port", 3000);
});

app.use('/', restaurants);

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something went wrong!');
});