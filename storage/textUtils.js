// See http://unicode.org/versions/Unicode5.2.0/ch03.pdf
// 3.12 Hangul Syllable Decomposition
// Jamo codes: http://www.unicode.org/charts/PDF/U1100.pdf

const SBase = 0xAC00
const LBase = 0x1100
const VBase = 0x1161
const TBase = 0x11A7
const VCount = 21
const TCount = 28
const NCount = VCount * TCount


const decompose = (syllable) => {
    const S = syllable.charCodeAt(0)
    const SIndex = S - SBase
    const L = LBase + Math.floor(SIndex / NCount)  // Leading consonant
    const V = VBase + Math.floor((SIndex % NCount) / TCount)  // Vowel
    const T = TBase + SIndex % TCount  // Trailing consonant

    const result = (T === TBase) ?  [L, V] : [L, V, T]

    let resString = []
    for (let entry of result) {
        resString.push(String.fromCharCode(entry))
    }
    return resString
}

function isJamoCompatible(syllable) {
    return 0x3130 <= syllable.charCodeAt(0) && syllable.charCodeAt(0) <= 0x318F
}

function initialToLetter(syllable) {
    const compatibleToInitial  = new Map([
        ['ᄀ', 'ㄱ'],  
        ['ᄁ', 'ㄲ'],
        ['ᄂ', 'ㄴ'],
        ['ᄃ', 'ㄷ'],
        ['ᄄ', 'ㄸ'],
        ['ᄅ', 'ㄹ'],
        ['ᄆ', 'ㅁ'],
        ['ᄇ', 'ㅂ'],
        ['ᄈ', 'ㅃ'],
        ['ᄉ', 'ㅅ'],
        ['ᄊ', 'ㅆ'],
        ['ᄋ', 'ㅇ'],
        ['ᄌ', 'ㅈ'],
        ['ᄍ', 'ㅉ'],
        ['ᄎ', 'ㅊ'],
        ['ᄏ', 'ㅋ'],
        ['ᄐ', 'ㅌ'],
        ['ᄑ', 'ㅍ'],
        ['ᄒ', 'ㅎ']
    ])
    return compatibleToInitial.get(syllable) ?? syllable
}

function middleToLetter(syllable) {   	 	 	 	 		 	 	 	 	 	 	 	 	 	 	 	 	 	 
    const compatibleToLetter  = new Map([
        ['ᅡ', 'ㅏ'],  
        ['ᅢ', 'ㅐ'],
        ['ᅣ', 'ㅑ'],
        ['ᅤ', 'ㅒ'],
        ['ᅥ', 'ㅓ'],
        ['ᅦ', 'ㅔ'],
        ['ᅧ', 'ㅕ'],
        ['ᅨ', 'ㅖ'],
        ['ᅩ', 'ㅗ'],
        ['ᅪ', 'ㅘ'],
        ['ᅫ', 'ㅙ'],
        ['ᅬ', 'ㅚ'],
        ['ᅭ', 'ㅛ'],
        ['ᅮ', 'ㅜ'],
        ['ᅯ', 'ㅝ'],
        ['ᅰ', 'ㅞ'],
        ['ᅱ', 'ㅟ'],
        ['ᅲ', 'ㅠ'],
        ['ᅳ', 'ㅡ'],
        ['ᅴ', 'ㅢ'],
        ['ᅵ', 'ㅣ']
    ])
    return compatibleToLetter.get(syllable) ?? syllable
}

function getStartingLetter(syllable) {
    const firstSyllable = syllable[0]
    if (firstSyllable.charCodeAt(0) < SBase || firstSyllable.charCodeAt(0) > 0xD7A3)
        return firstSyllable
    if(isJamoCompatible(firstSyllable))
        return firstSyllable
    const letters = decompose(firstSyllable)
    if (letters[0] == 'ᄋ') {
        return middleToLetter(letters[1])
    } else {
        return initialToLetter(letters[0])
    }
}

module.exports = {
    getStartingLetter,
}