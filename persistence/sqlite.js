const sqlite3 = require('sqlite3').verbose()
const fs = require('fs')
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
   // removeItem,
};