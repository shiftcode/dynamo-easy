import { promiseTap } from './promise-tap.function'

describe('PromiseTap', () => {
  const myVal = { myVal: true }

  it('should exec the given function but return the initial value', async () => {
    const spyFn = jasmine.createSpy().and.returnValue(null)

    const result = await Promise.resolve(myVal).then(promiseTap(spyFn))

    expect(spyFn).toHaveBeenCalled()
    expect(result).toEqual(myVal)
  })
})
