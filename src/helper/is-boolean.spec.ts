import { isBoolean } from './is-boolean.function'

describe('is boolean', () => {
  it('should be a boolean', () => {
    expect(isBoolean(true)).toBeTruthy()
    expect(isBoolean(false)).toBeTruthy()
    // tslint:disable:no-construct
    expect(isBoolean(new Boolean(1))).toBeTruthy()
    expect(isBoolean(new Boolean(0))).toBeTruthy()
  })

  it('should not be a boolean', () => {
    expect(isBoolean(0)).toBeFalsy()
    expect(isBoolean(1)).toBeFalsy()
    expect(isBoolean('a')).toBeFalsy()
    expect(isBoolean({})).toBeFalsy()
    expect(isBoolean([])).toBeFalsy()
  })
})
