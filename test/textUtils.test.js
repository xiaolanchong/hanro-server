const chai = require('chai')
const expect = chai.expect
const assert = chai.assert
const textUtils = require('../storage/textUtils')

describe('Decompose', () => {
    it('1 letters', () => {
        assert(textUtils.getStartingLetter('ㄱ'), 'ㄱ')
    });
    it('2 letters', () => {
        assert(textUtils.getStartingLetter('가'), 'ㄱ')
    });
    it('3 letters', () => {
        assert(textUtils.getStartingLetter('륜'), 'ㄹ')
    });
    it('4 letters', () => {
        assert(textUtils.getStartingLetter('값'), 'ㄱ')
    });
        
    it('no initial', () => {
        assert(textUtils.getStartingLetter('아'), 'ㅏ')
    });
    it('no initial, diphtong', () => {
        assert(textUtils.getStartingLetter('왕'), 'ㅘ')
    });
    it('non Korean', () => {
        assert(textUtils.getStartingLetter('eng'), 'e')
    });        
})