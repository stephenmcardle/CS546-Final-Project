const data = require('../data');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt-nodejs');
const flash = require('connect-flash');

module.exports = (passport, LocalStrategy) => {
    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(user, done) {
        done(null, user);
    });
    passport.use(new LocalStrategy({
        passReqToCallback: true
    },
    function (req, username, password, done) {
        data.users.findUserByUsername(username).then((user) => {
            if(!bcrypt.compareSync(password, user.hashedPassword)) {
                return done(null, false, req.flash('invalid', 'Invalid Password'));
            }
            else {
                return done(null, user);
            }
        }).catch((err) => {
            console.log(err);
            return done(null, false, req.flash('invalid', 'Invalid Username'));
        });
    }));
};
