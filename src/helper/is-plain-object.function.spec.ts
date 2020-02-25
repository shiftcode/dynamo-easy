import { isPlainObject } from './is-plain-object.function'

class Foo {
  a = 1
}

describe('isPlainObject', () => {
  it('should work', () => {
    expect(isPlainObject({})).toBeTruthy()
    expect(isPlainObject(Object.create({}))).toBeTruthy()
    expect(isPlainObject(Object.create(Object.prototype))).toBeTruthy()
    expect(isPlainObject({ x: 0, y: 0 })).toBeTruthy()

    expect(isPlainObject([])).toBeFalsy()
    expect(isPlainObject([1, 2, 3])).toBeFalsy()
    expect(isPlainObject(1)).toBeFalsy()
    expect(isPlainObject(null)).toBeFalsy()
    expect(isPlainObject(Object.create(null))).toBeFalsy()
    expect(isPlainObject(new Foo())).toBeFalsy()
  })
})
