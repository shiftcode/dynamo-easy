import { curry } from './curry.function'

function a(x: number, y: string, z: boolean | null) {
  return [x, y, z]
}

describe('curry', () => {
  it('should work (w/o arity)', () => {
    expect(curry(a)(2)('ok')(true)).toEqual([2, 'ok', true])
    expect(curry(a)(4, 'NOK')(false)).toEqual([4, 'NOK', false])
    expect(curry(a)(6, 'FOO', null)).toEqual([6, 'FOO', null])
  })

  it('should work (w/ arity)', () => {
    expect(typeof curry(a, 4)(6, 'FOO', null)).toEqual('function')
  })
})
