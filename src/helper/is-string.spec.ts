/* eslint-disable no-new-wrappers */

import { isString } from './is-string.function'

describe('is string', () => {
  it('should be a string', () => {
    expect(isString('myValue')).toBeTruthy()
    expect(isString(new String('2'))).toBeTruthy()
    expect(isString(new String('someValue'))).toBeTruthy()
  })

  it('should not be a string', () => {
    expect(isString(3)).toBeFalsy()
    expect(isString(true)).toBeFalsy()
    expect(isString({})).toBeFalsy()
    expect(isString([])).toBeFalsy()
  })
})
