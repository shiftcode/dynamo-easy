import { Observable } from 'rxjs/Observable'
import { SessionValidityEnsurer } from './session-validity-ensurer.type'

/**
 * A simple no-op function which tells that we always have a valid session, which obviously requires some valid
 * session checking and also renewing of a potentially expired (or non existing) session
 * // todo add sample implementation
 *
 * @returns {Observable<any>}
 * @constructor
 */
export const DEFAULT_SESSION_VALIDITY_ENSURERE: SessionValidityEnsurer = () => Observable.of()
