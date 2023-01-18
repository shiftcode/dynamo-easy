import { promiseTap } from './promise-tap.function'

describe('PromiseTap', () => {
  const myVal = { myVal: true }

  it('should exec the given function but return the initial value', async () => {
    const mock = jest.fn().mockReturnValueOnce(null)

    const result = await Promise.resolve(myVal).then(promiseTap(mock))

    expect(mock).toHaveBeenCalled()
    expect(result).toEqual(myVal)
  })
})
