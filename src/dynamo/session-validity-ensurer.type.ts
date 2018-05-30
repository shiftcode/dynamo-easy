import { Observable } from 'rxjs'

export type SessionValidityEnsurer = () => Observable<void>
