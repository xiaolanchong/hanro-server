const session = require('express-session');  // session middleware
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

let db

function initOnStart(app, passport, db) {
    module.db = db
    const secret = '6li#t3r!n9Pr$z3S'
    const sessionMiddleware = session({
        store: db.createSessionStore(session),
        secret,
        resave: true,
        rolling: true,
        saveUninitialized: false,
        cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30d
        httpOnly: false,
        },
    })

    app.use(sessionMiddleware)

    const strategy = new LocalStrategy(function verify(username, password, cb) {
        db.getUser(username, function(err, user) {
            if (err) { return cb(err); }
            if (!user) { return cb(null, false, { message: 'Incorrect username or password.' }); }
    
            bcrypt.compare(password, user.password_hash, function(err, result) {
                if (err) { return cb(err); }
                if(result)
                    return cb(null, user)           
                else
                    return cb(null, false, { message: 'Incorrect username or password.' })
            })
        })
    })
    passport.use(strategy)

    passport.serializeUser((user, done) => {
        done(null, user.id);
      });
      
    passport.deserializeUser((id, done) => {
        db.getUserById(id, function(err, user){
            if(err)
                done(err)
            else
                done(null, user)
        })
    });
}


module.exports = {
    initOnStart,
}