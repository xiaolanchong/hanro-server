const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
const sessionDbDir = __dirname + '/../..'
const location = process.env.SQLITE_DB_LOCATION || __dirname + '/../../hanro-dict.db'

let db;

function init() {
    return new Promise((acc, rej) => {
        db = new sqlite3.Database(location, err => {
            if (err) return rej(err);

            if (process.env.NODE_ENV !== 'test')
                console.log(`Using sqlite database at ${location}`);
            acc();
        });
    });
}

async function teardown() {
    return new Promise((acc, rej) => {
        db.close(err => {
            if (err) rej(err);
            else acc();
        });
    });
}

async function getDistinctWords(startWith, offset, limit) {
    return new Promise((acc, rej) => {
        if (startWith === undefined) {
            const command = 'SELECT DISTINCT word FROM word'
            db.all(command, (err, rows) => {
                if (err) return rej(err)
                acc(
                    rows.map(item => item.word)
                )
            });     
        } else {
            const command ="SELECT DISTINCT word FROM word " + 
            "WHERE word LIKE $pattern OR word LIKE $suffix_pattern " +
            "ORDER BY word ASC " +
            "LIMIT $limit OFFSET $offset"
            const params = {
                $pattern: `${startWith}%`,
                $suffix_pattern: `-${startWith}%`,
                $offset: offset,
                $limit: limit,
            }
            db.all(command, params, (err, rows) => {
                if (err) return rej(err);
                acc(
                    rows.map(item => item.word)
                )
            });
        }
    });
}

async function getWordDefinitions(word) {
    return new Promise((acc, rej) => {
        const command = 'SELECT id, word, definition FROM word WHERE word=?'
        db.all(command, [word], (err, rows) => {
            if (err) return rej(err)
            acc(
                rows.map(item => { return {id: item.id, word: item.word, definition: item.definition}})
            )
        })
    });
}

async function addWord(word, definition, order, user_id) {
    return new Promise((acc, rej) => {
        const now = Date(Date.now())
        db.run(
            'INSERT INTO word (word, definition, order, last_edited_by_user, last_edited) ' +
            'VALUES (?, ?, ?, ?, ?")',
            [word, order, definition, user_id, now],
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
}

async function updateWord(id, definition, user_id) {
    return new Promise((acc, rej) => {
        db.run(
            'UPDATE word SET definition=$definition, last_edited_by_user=$user_id, last_edited=$when' + 
            'WHERE id = $id',
            {
                $id: id,
                $definition: definition,
                $user_id: user_id,
                $when: new Date(),
            },
            err => {
                if (err) return rej(err);
                acc();
            },
        );
    });
} 

function getUser(username, callback) {
    db.all('SELECT * FROM user WHERE username = ? LIMIT 1', [ username ], 
        function(err, users) {
            callback(err, users[0])
        }
    )
}

function getUserById(userId, callback) {
    db.all('SELECT * FROM user WHERE id = ? LIMIT 1', [ userId ], 
        function(err, users) {
            callback(err, users[0])
        }
    )
}

function createSessionStore(session) {
    var SQLiteStore = require('connect-sqlite3')(session)
    const params = {
        table:  'sessions',
        db:     'hanro-sessions.db',
        dir:    sessionDbDir,
    }
    return new SQLiteStore(params)
}

const errorDescs = new Map([
    ['SQLITE_CONSTRAINT', 'User already exists']
])

async function createUser(username, password_hash, email) {
    return new Promise((acc, rej) => {
        const USER = 0
        const defaultRole = USER
        db.run(
            'INSERT INTO user(username, email, password_hash, role) VALUES(?, ?, ?, ?)', [username, email, password_hash, defaultRole],
            function(err) {
                if (err) {
                    console.log(err)
                    return rej(errorDescs.has(err.code) ? errorDescs.get(err.code): 'Database error')
                }
                const user = { 
                    id: this.lastID,
                    username: username,
                    email: email,
                    role: defaultRole,
                }
                acc(user);
            },
        );
    });    
}

/*
async function removeItem(id) {
    return new Promise((acc, rej) => {
        db.run('DELETE FROM todo_items WHERE id = ?', [id], err => {
            if (err) return rej(err);
            acc();
        });
    });
}
*/

module.exports = {
    init,
    teardown,
    getDistinctWords,
    getWordDefinitions,
    addWord,
    updateWord,

    getUser,
    getUserById,
    createSessionStore,
    createUser,
   // removeItem,
};