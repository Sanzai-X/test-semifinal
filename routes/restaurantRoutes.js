const router = require('express').Router();
const restaurantController = require('../controllers/restaurantController');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel= require('../models/user');
const { isAuthenticated, notAuthenticated } = require('../config/auth');

router.get('/', restaurantController.getTop3);

router.get('/register', notAuthenticated, (req, res) => res.render('register'));

router.post('/register', bodyparser.json(), async (req, res) => {
    const { username, name, password, confirmPass, isOwner, userphoto, description} = req.body;
    let error_msg = [];

    if(!req.body.username || !name || !password || !confirmPass){
        error_msg.push({ msg: 'Please fill in all fields'});
    }

    if(password !== confirmPass){
        error_msg.push({ msg: 'Passwords do not match'});
    }

    if(password.length < 6){
        error_msg.push({ msg: 'Password should be atleast 6 characters' });
    }

    console.log("Errors:", error_msg);
    // console.log('restaurantRoutes username | ' + username);

    if(error_msg.length > 0){
        res.render('register',{
            error_msg,
            username,
            name,
            password,
            confirmPass,
            userphoto: '',
            isOwner: false,
            description: ''
        })
    } else {
        // const errors = validationResult(req);

        try {
            const existingUser = await userModel.findOne({ username: req.body.username });
            console.log("restaurantRoutes existing user: | ", existingUser);
            if (existingUser) {
                error_msg.push({ msg: 'Username is already registered' });
                return res.render('register', {
                    error_msg,
                    username,
                    name,
                    password,
                    confirmPass,
                    userphoto: '',
                    isOwner: false,
                    description: ''
                });
            } else {
                const newUser = await userModel.create({
                    username,
                    password,
                    name,
                    description,
                    userphoto: "",
                    isOwner: false
                });

                // hash password
                bcrypt.genSalt(10, (err, salt) => 
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        if(err){
                            throw err;
                        }
                        // set passowrd to hash
                        newUser.password = hash;

                        newUser.save()
                            .then(user => {
                                req.flash('success_msg', 'You are now registered! Login below.');
                                res.redirect('/login');
                            }).catch(err => console.log(err));
                    }))

                // userModel.registerUser(newUser);
               // req.flash('success_msg', 'You are now registered! Login below.');
              //  res.redirect('/login');
            }
        } catch (err) {
            console.error(err);
            req.flash('error_msg', 'Could not create user. Please try again.');
            res.redirect('/register');
        }
    }
});

router.get("/login", notAuthenticated, (req, res) => {
    res.render("login");
  });

router.post("/login", 
    passport.authenticate("local", {
        successRedirect: '/',
        failureRedirect: '/login',
        failureFlash: true

    })
);

router.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Internal Server Error');
        }
        req.flash('success_msg', 'You are logged out');
        res.redirect('/login');
    });
});

router.get('/profile/:id', isAuthenticated, restaurantController.viewProfile);

// router.get('/viewRestaurant/:id2/logged/:id', isAuthenticated, restaurantController.viewResto);

router.get('/viewRestaurant/:id', isAuthenticated, restaurantController.viewResto);

module.exports = router;