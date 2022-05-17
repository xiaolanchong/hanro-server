const express = require('express')
const app = express()
const passport = require('passport')

const db = require('./persistence');
const storage = require('./storage/storage')
const authServer = require('./storage/authserver')
const routes = require('./routes')


app.use(express.json())
app.use(passport.initialize())
authServer.initOnStart(app, passport, db)
app.use(passport.session())

const UNAUTHORIZED = 401

/// Converts logic level user to that seen by app clients
function toExternalUser(user) {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  }
}

app.post('/api/login',
  passport.authenticate('local', { failWithError: true, session: true }),
  function(req, res, next) {
    // Successful auth
    const user = req.user
    return res.send({ 
        success: true,
        message: 'Logged in',
        ...toExternalUser(user),
    })
  },
  function(err, req, res, next) {
    // Auth error
    return res.status(UNAUTHORIZED).send({ success: false, message: err })
  }
)

function mustBeAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        return res.status(UNAUTHORIZED).send({});
    }
    next();
}

app.post('/api/logout', mustBeAuthenticated, (req, res) => {
    req.logOut()
    res.send({})
})

app.post('/api/register',
  passport.authenticate('register', { failWithError: true, session: true }),
  function(req, res, next) {
    // Successful auth
    const user = req.user
    return res.send({ 
        success: true,
        message: 'Registered',
        ...toExternalUser(user),
    })
  },
  function(err, req, res, next) {
    // Auth error
    return res.status(UNAUTHORIZED).send({ success: false, message: err })
  }
)


app.get('/api/index', routes.getIndex)
app.get('/api/index/:startWith', routes.getIndex)
app.get('/api/words/:startWith', routes.getWords)
app.get('/api/word/:word', routes.getWord)

app.get('/api/getUserInfo', (req, res) => {
    if (req.user !== undefined) {
        const user = req.user
        res.send({
          ...toExternalUser(user),
        })
      } else
        res.status(UNAUTHORIZED)
})

const port = process.env.PORT || 3500

db.init().then(() => {
        storage.init(db).then(() => {
            routes.init(storage)
            app.listen(port, () => console.log(`Listening on port ${port}`));
    })
}).catch((err) => {
    console.error(err);
    process.exit(1);
});

const gracefulShutdown = () => {
    db.teardown()
        .catch(() => {})
        .then(() => process.exit());
};

process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
process.on('SIGUSR2', gracefulShutdown); // Sent by nodemon
