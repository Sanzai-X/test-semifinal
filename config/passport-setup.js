const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');

module.exports = function(passport) {
    // this uses local strategy to validate whether the user already has the right
    // password and the username already exists in the database
    passport.use(new LocalStrategy({ usernameField: 'username' }, async (username, password, done) => {
        try {
            if (!username || !password) {
                return done(null, false, { message: 'Please provide username and password' });
            }

            const user = await User.findOne({ username });
            // console.log(user);
            // console.log('Username ', user.username);
            // console.log('Pass: ', user.password);
            if (!user) {
                return done(null, false, { message: 'That username is not registered' });
            }

            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Password incorrect' });
                }
            });
        } catch (err) {
            console.error(err);
            return done(err);
        }
    }));

    // save the data of the user whose logged in to the local storage 
    // and use done to pass the details of the user 
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    // saves the user's information to the local session and when we want to 
    // get hold of the user we deserialize it back
    passport.deserializeUser(function(id, done){
        User.findById(id)
            .then(user => {
                done(null, user);
            })
            .catch(err => {
                done(err, null);
            });
    });
}

/* in case the serialized function doesn't work, try the other implementation:

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.getCurrent(id, (err, user) => {
            done(err, user);
        });
    });

    other wise:
    passport.serializeUser(function(user, done){
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done){
        User.getCurrent(id, function(err, user){
            done(err, user);
        });
    });
}
*/