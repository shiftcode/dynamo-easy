import { promiseDelay } from './promise-delay.function'

describe('PromiseDelay', () => {
  const myVal = { myVal: true }
  const delay = 300

  it('should delay a promise value', async () => {
    const startTime = Date.now()
    const result = await Promise.resolve(myVal).then(promiseDelay(delay))
    const endTime = Date.now()

    expect(result).toEqual(myVal)
    expect(endTime - startTime >= delay).toBeTruthy()
  })
})
