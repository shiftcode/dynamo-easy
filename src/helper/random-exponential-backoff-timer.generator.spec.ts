import { randomExponentialBackoffTimer } from './random-exponential-backoff-timer.generator'

describe('random exponential backoff timer', () => {

  let g: IterableIterator<number>

  beforeEach(() => g = randomExponentialBackoffTimer())

  it('should generate randomly values that are getting larger', () => {
    expect(g.next().value).toBeLessThanOrEqual(0.5)
    expect(g.next().value).toBeLessThanOrEqual(1.5)
    expect(g.next().value).toBeLessThanOrEqual(3.5)
    expect(g.next().value).toBeLessThanOrEqual(7.5)
    expect(g.next().done).toBe(false)
  })

})
