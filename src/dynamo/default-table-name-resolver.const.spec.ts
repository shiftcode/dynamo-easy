import { Observable } from 'rxjs'
import { DEFAULT_SESSION_VALIDITY_ENSURER } from './default-session-validity-ensurer.const'

describe('DEFAULT_SESSION_VALIDITY_ENSURER', () => {
  it('should return an observable without value', async () => {
    expect(typeof DEFAULT_SESSION_VALIDITY_ENSURER === 'function').toBeTruthy()
    expect(DEFAULT_SESSION_VALIDITY_ENSURER() instanceof Observable).toBeTruthy()
    expect(await DEFAULT_SESSION_VALIDITY_ENSURER().toPromise()).toBeUndefined()
  })
})
