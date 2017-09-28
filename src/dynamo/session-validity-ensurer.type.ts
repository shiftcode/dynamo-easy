import { Observable } from 'rxjs/Observable'

export type SessionValidityEnsurer = () => Observable<void>
