const textUtils = require('./textUtils')

let db
let cachedLetterIndex = []
let cachedSyllableIndex = {}

function cacheIndices(words) {
    const cachedSyllableDict = {}
    words.forEach(word => {
        const firstSyllable = word[0]
        if(firstSyllable === '-')
            return

        if (!(firstSyllable in cachedSyllableDict)) {
            cachedSyllableDict[word[0]] = true
        }
    })
    
    cachedSyllableIndex = {}
    const allFirstSyllables = Array.from( Object.keys(cachedSyllableDict) )
    for (const syl of allFirstSyllables) {
        const startingLetter = textUtils.getStartingLetter(syl)
        if (startingLetter in cachedSyllableIndex)
            cachedSyllableIndex[startingLetter].push(syl)
        else
            cachedSyllableIndex[startingLetter] = [syl]
    }
 
    for (const [, value] of Object.entries(cachedSyllableIndex)) {
        value.sort();
    }

    cachedLetterIndex = Array.from( Object.keys(cachedSyllableIndex) )
    cachedLetterIndex.sort()
}

async function init(usedDb) {
    db = usedDb
    const words = await db.getDistinctWords()
    cacheIndices(words)
}

async function getIndex(startWith) {
    if (startWith === undefined) {
        return cachedLetterIndex
    } 
    
    if (startWith.length === 1 && 
        startWith === textUtils.getStartingLetter(startWith)){
        return cachedSyllableIndex[startWith] || []
    }

    return []
}

async function getWords(startWith, offset, limit) {
    return db.getDistinctWords(startWith, offset, limit)
}

async function getWordDefinitions(word, limit) {
    return db.getWordDefinitions(word, limit)
}

module.exports = {
    init,
    getIndex,
    getWords,
    getWordDefinitions
}