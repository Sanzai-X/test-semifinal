const restoModel = require('../models/restaurant');
const userModel = require('../models/user');
const bodyparser = require('body-parser');
const passport = require('passport');
const multer = require('multer');
const path = require('path');
const bcrypt = require('bcryptjs');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/images')
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        checkFileType(file, cb);
    }
}).single("image");

function checkFileType(file, cb){
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if(mimetype && extname){
        return cb(null, true);
    }else{
        cb(null, false, new Error('Error: Images Only!'));
    }
}

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
	const { username, name, password, confirmPass, isOwner, userphoto, description } = req.body;
    let error_msg = [];

    if (!username || !name || !password || !confirmPass) {
        error_msg.push({ msg: 'Please fill in all fields' });
    }

    if (password !== confirmPass) {
        error_msg.push({ msg: 'Passwords do not match' });
    }

    if (password.length < 6) {
        error_msg.push({ msg: 'Password should be at least 6 characters' });
    }

    if (error_msg.length > 0) {
        res.render('register', {
            error_msg,
            username,
            name,
            userphoto: '',
            isOwner: false,
            description: ''
        });
    } else {
        try {
            const existingUser = await userModel.findOne({ username });
            if (existingUser) {
                error_msg.push({ msg: 'Username is already registered' });
                res.render('register', {
                    error_msg,
                    username,
                    name,
                    userphoto: '',
                    isOwner: false,
                    description: ''
                });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, async (err, hash) => {
                        if (err) throw err;
                        try {
                        	console.log(userModel);
                            const newUser = await userModel.create({
                                username,
                                password: hash,
                                name,
                                description,
                                userphoto: "",
                                isOwner: false
                            });
                            req.flash('success_msg', 'You are now registered! Login below.');
                            res.redirect('/login');
                        } catch (error) {
                            console.error(error);
                            req.flash('error_msg', 'Could not create user. Please try again.');
                            res.redirect('/register');
                        }
                    });
                });
            }
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Could not create user. Please try again.');
            res.redirect('/register');
        }
    }
}

exports.viewProfile = async function(req, res){
	try{
		console.log('req.session.user: ', req.user);
		console.log('req.session.user.username: ', req.user.username);
		console.log('req.session.user._id: ', req.user.id);
		console.log(req.params.id);
		const user = await userModel.findById(req.user._id);
		const reviews = await restoModel.getUserReviews(req.params.id);
		const persontobeviewed = await userModel.findById(req.params.id);
		var sameuser;
		if(user.username == persontobeviewed.username){
			sameuser = true;
		}
		else{
			sameuser = false;
		}
		console.log(user);
		console.log(persontobeviewed);
		console.log(sameuser);
		const dynamicHeight = 150.8 * reviews.length;
		console.log(user.username);
		res.render('profile', {ppic: persontobeviewed.userphoto, h_user: user.username, img_url: user.userphoto, fullname: persontobeviewed.name, blogs: reviews, loggedIn: true, v_user: persontobeviewed.username, numReviews: reviews.length, user_id: req.user.id, sameuser: sameuser});
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
		// const dynamicHeight = 150.8 * resto.reviews.length;
		console.log('View Resto Id: ', req.params.id);
		console.log('View Resto', resto.reviews);
		if(req.user){
			const user = await userModel.findById(req.user.id);
			console.log(user);
			res.render('restaurant', {ppic: resto.images[0], h_user: user.username, blogs: reviews, loggedIn: true, numReviews: reviews.length, user_id: user.id, restoid: req.params.id});
		}
		else{
			res.render('restaurant', {ppic: resto.images[0], blogs: reviews, loggedIn: false, numReviews: reviews.length, restoid: req.params.id});
		}
	}
	catch (error){
		console.log(error);
		res.status(500).send("Internal Server Error")
	}
}

exports.upload = async function(req, res){
	try{
		res.render('upload');
	}
	catch(error){
		console.log(error);
	}
}

exports.uploadImg = async function(req,res){
	upload(req,res,(err) => {
		if(err){
			res.redirect('/upload');
		} else {
			console.log("else");
			if(req.file == undefined){
				res.render('upload', {msg: "Undefined file type!"});
			} else {
				res.send("File successfully uploaded");
			}
		}
	});
}

exports.editprofile = async function(req,res){
    try{
        const user = await userModel.findById(req.user.id);
        console.log(req.params.id);
        console.log(user);
        res.render('editprofile', {h_user: user.username, loggedIn: true, user_id: req.user.id});
    }
    catch (error){
        console.log(error);
        // res.status(500).send("Internal Server Error")
    }
}

exports.editprofilereflect = async function(req, res){
	try{
		let{username, description} = req.body;
		var userphoto;
		if(!username){
			username = req.user.username;
		}
		const foundUser = await userModel.findOne({username: username});
		if(username == foundUser.username){
			username = req.user.username;
		}

		if(!description){
			description = req.user.description;
		}
		upload(req,res,(err) => {
			console.log("checking if this function fucking works");
			if(err){
				console.log("checking")
				res.redirect('/upload');
			} else {
				console.log("else");
				if(req.file == undefined){
					console.log("undefined file");
					userphoto = req.user.userphoto;
				} else {
					console.log("file uploaded");
					userphoto = `\\images\\${req.file.filename}`
				}
			}
		});

		const result = await userModel.findByIdAndUpdate(req.user._id, {
			$set: {
                username: username,
                description: description,
                userphoto: userphoto
            }
		}, {new: true, runValidators: true});

		res.redirect(`/profile/${req.user._id}`);
	}
	catch(error){
		console.log(error);
	}
}

exports.editReview = async function(req,res) {
	try{
		const review = await restoModel.findReview(req.params.id);
		const resto = await restoModel.find(req.params.id);
		const persontobeviewed = await userModel.findById(review.user._id);
		if(req.user){
			res.render('editReview',{ppic: review.user.userphoto, h_user: review.user.username, title: review.title, loggedIn: true, content: review.content, rating: review.rating, restoid: review._id._id, restoname: review.name});
		}
	}
	catch(e){
		console.log(e);
		res.status(500).send("Internal Server Error");
	}
}

exports.createreview = async function(req,res){
	try{
		const resto = await restoModel.getCurrent(req.params.id);
		if(req.user){
			const user = await userModel.findById(req.user.id);
			console.log(resto.name);
			res.render("createreview", {resto: resto.name, h_user: user.username, loggedIn: true, user_id: user.id});
		}
	}
	catch (e){
		console.log(e)
		res.status(500).send("Internal server Error");
	}
};