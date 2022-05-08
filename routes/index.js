
let storage

function init(usedStorage) {
    storage = usedStorage
}

async function getIndex(req, res) {
    const words = await storage.getIndex(req.params.startWith);
    res.send(words);
}

async function getWords(req, res) {
    const offsetStr = req.query['offset'] || '0'
    const limitStr = req.query['limit'] || '100'
    const limit = parseInt(limitStr)
    const offset = parseInt(offsetStr)
    if(isNaN(limit)) {
        res.status(400).send("'limit' query parameter mast be integer")
        return
    }
    if(isNaN(offset)) {
        res.status(400).send("'offset' query parameter mast be integer")
        return
    }
    const words = await storage.getWords(req.params.startWith, offset, limit);
    res.send(words);
}

async function getWord(req, res) {
    const limit = 50
    const definitions = await storage.getWordDefinitions(req.params.word, limit);
    res.send(definitions);  
}

module.exports = {
    init,
    getIndex,
    getWords,
    getWord,
}
