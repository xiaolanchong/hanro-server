const session = require('express-session');  // session middleware
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy

let db

function initOnStart(app, passport, newDb) {
    db = newDb
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

    const authStrategy = new LocalStrategy(function verify(username, password, cb) {
        db.getUser(username, function(err, user) {
            const errorDesc =  'Incorrect username or password.'
            if (err) { return cb(err); }
            if (!user) { return cb(errorDesc, false, { message: 'Incorrect username or password.' }); }
    
            bcrypt.compare(password, user.password_hash, function(err, result) {
                if (err) { return cb(err); }
                if(result)
                    return cb(null, user)           
                else
                    return cb(errorDesc, false, { message: 'Incorrect username or password.' })
            })
        })
    })
    passport.use(authStrategy)
    addRegisterStrategy(passport)

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

function addRegisterStrategy(passport) {
    // strategy to use if email(instead of username) and password fields provided
    const regStrategy = new LocalStrategy({
        usernameField : 'email',
        passwordField : 'password',
        passReqToCallback: true
      }, async (req, email, password, done) => {
        try {
            const saltRounds = 10
            const password_hash = await bcrypt.hash(password, saltRounds)
            const username = req.body.username;
            const user = await db.createUser(username, password_hash, email);
            return done(null, user);
        } catch (error) {
            done(error)
        }
      })
      passport.use('register', regStrategy)
}


module.exports = {
    initOnStart
}