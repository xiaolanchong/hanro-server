const express = require('express')
const app = express()

const db = require('./persistence');
const storage = require('./storage/storage')
const routes = require('./routes')

app.use(express.json());

app.get('/api/index', routes.getIndex)
app.get('/api/index/:startWith', routes.getIndex)
app.get('/api/words/:startWith', routes.getWords)
app.get('/api/word/:word', routes.getWord)

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
