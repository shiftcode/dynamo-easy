import { isNumber } from './is-number.function'

describe('is number', () => {
  it('should be a number', () => {
    expect(isNumber(3)).toBeTruthy()
    expect(isNumber(NaN)).toBeTruthy()
    expect(isNumber(Infinity)).toBeTruthy()
    // tslint:disable:no-construct
    expect(isNumber(new Number('2'))).toBeTruthy()
    expect(isNumber(new Number('myNumber'))).toBeTruthy()
  })

  it('should not be a number', () => {
    expect(isNumber('a')).toBeFalsy()
    expect(isNumber({})).toBeFalsy()
    expect(isNumber([])).toBeFalsy()
  })
})
