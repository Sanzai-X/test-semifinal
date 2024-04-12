

module.exports = {
    isAuthenticated: function(req, res, next) {
        if(req.isAuthenticated()){
            return next();
        }
        req.flash('error', 'Please log in to be able to write a review and use other features');
        res.redirect('/login');
    },
    notAuthenticated: function(req, res, next) {
        if (!req.isAuthenticated()) {
          return next();
        }
        res.redirect('/');      
    }
}