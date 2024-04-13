const router = require('express').Router();
const restaurantController = require('../controllers/restaurantController');
const bodyparser = require('body-parser');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const userModel= require('../models/user');
const { isAuthenticated, notAuthenticated } = require('../config/auth');

router.get('/', restaurantController.getTop3);

router.get('/register', notAuthenticated, (req, res) => res.render('register'));

router.post('/register', bodyparser.json(), restaurantController.register);

router.get("/createreview/:id", isAuthenticated, restaurantController.createreview);

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

router.get('/upload', isAuthenticated, restaurantController.upload);

router.post('/upload', isAuthenticated, restaurantController.uploadImg);

router.get('/editprofile/:id', isAuthenticated, restaurantController.editprofile);

router.post('/editprofile/:id', isAuthenticated, restaurantController.editprofilereflect);



module.exports = router;