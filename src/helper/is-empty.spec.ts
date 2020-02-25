import { isEmpty } from './is-empty.function'

describe('isEmpty', () => {
  it('should work', () => {
    expect(isEmpty({})).toBeTruthy()
    expect(isEmpty({ ok: true })).toBeFalsy()
    expect(isEmpty('')).toBeTruthy()
    expect(isEmpty('ok')).toBeFalsy()
    expect(isEmpty()).toBeTruthy()
  })
})
