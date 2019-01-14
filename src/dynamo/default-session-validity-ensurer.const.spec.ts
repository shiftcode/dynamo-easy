import { DEFAULT_SESSION_VALIDITY_ENSURER } from './default-session-validity-ensurer.const'

describe('DEFAULT_SESSION_VALIDITY_ENSURER', () => {
  it('should return a promise without value', async () => {
    expect(typeof DEFAULT_SESSION_VALIDITY_ENSURER === 'function').toBeTruthy()
    expect(DEFAULT_SESSION_VALIDITY_ENSURER() instanceof Promise).toBeTruthy()
    expect(await DEFAULT_SESSION_VALIDITY_ENSURER()).toBeUndefined()
  })
})
