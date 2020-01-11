import { isString } from './is-string.function'

describe('is string', () => {
  it('should be a number', () => {
    expect(isString('myValue')).toBeTruthy()
    // tslint:disable:no-construct
    expect(isString(new String('2'))).toBeTruthy()
    expect(isString(new String('someValue'))).toBeTruthy()
  })

  it('should not be a number', () => {
    expect(isString(3)).toBeFalsy()
    expect(isString(true)).toBeFalsy()
    expect(isString({})).toBeFalsy()
    expect(isString([])).toBeFalsy()
  })
})
