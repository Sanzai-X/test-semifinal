const restoModel = require('../models/restaurant');
const userModel = require('../models/user');
const bodyparser = require('body-parser');
const passport = require('passport');

exports.getTop3 = async function(req, res) {
	try {
		const trend_restaurants = await restoModel.getTop3();
		const plain_trend_restaurants = trend_restaurants.map(doc=> doc.toObject());
		if(req.user){
			const user = await userModel.findById(req.user.id);
			res.render('index', {h_user: user.username, img_url: user.userphoto, restaurants: plain_trend_restaurants, loggedIn: true, user_id: user.id});
		}
		else {
			res.render('index', {restaurants: plain_trend_restaurants, loggedIn: false});
		}	
	} catch(err){
		console.error(err);
	}
};

exports.loginpage = async function(req, res){
	try{
		res.render('login', {title: "Login Account"});
	}
	catch (err){
		console.error(err);
	}
};

exports.login = async function(req, res, next){
	
	try {
        const user = await userModel.loginUser({username: req.body.username, password: req.body.password});
        console.log(user);
        if (user) {  
            console.log('logged in successfully');
            res.redirect("/"); // this part will redirect the user to the main page
        } else {
            console.log('did not login successfully');
            res.render("login", { title: "Login Account", error: "Invalid username or password" });
        }
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal Server Error");
		

    }
	
	
};

exports.register = async function(req, res){
	
}

exports.viewProfile = async function(req, res){
	try{
		console.log('req.session.user: ', req.user);
		console.log('req.session.user.username: ', req.user.username);
		console.log('req.session.user._id: ', req.user.id);
		const user = await userModel.findById(req.user._id);
		const reviews = await restoModel.getUserReviews(req.params.id);
		const persontobeviewed = await userModel.findById(req.params.id);
		const dynamicHeight = 150.8 * reviews.length;
		console.log(user.username);
		res.render('profile', {ppic: persontobeviewed.userphoto, h_user: user.username, img_url: user.userphoto, fullname: persontobeviewed.name, blogs: reviews, loggedIn: true, v_user: persontobeviewed.username, numReviews: reviews.length, user_id: req.user.id});
	}
	catch (error){
		console.log(error);
		res.status(500).send("Internal Server Error")
	}
}

exports.viewResto = async function(req, res){
	try{
		const resto = await restoModel.getCurrent(req.params.id);
		const reviews = resto.reviews.map(doc=> doc.toObject());
		const dynamicHeight = 150.8 * resto.reviews.length;
		console.log('View Resto Id: ', req.params.id);
		console.log('View Resto', resto.reviews);
		if(req.user){
			const user = await userModel.findById(req.user.id);
			console.log(user);
			res.render('restaurant', {ppic: resto.images[0], h_user: user.username, blogs: reviews, loggedIn: true, numReviews: reviews.length, user_id: user.id});
		}
		else{
			res.render('restaurant', {ppic: resto.images[0], blogs: reviews, loggedIn: false, numReviews: reviews.length});
		}
	}
	catch (error){
		console.log(error);
		res.status(500).send("Internal Server Error")
	}
}