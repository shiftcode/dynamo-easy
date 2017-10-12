import { Key, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { QueryResponse } from '../request/query/query.response'
import { ScanResponse } from '../request/scan/scan.response'

// O comes from Output, thats how the original name was in the dynamoDB typing for untyped response
export interface Pageable<T, R, O extends QueryResponse<T> | ScanResponse<T>> {
  limit(limit: number): R
  exclusiveStartKey(key: Key | null): R
  execCount(): Observable<number>
  execFullResponse(): Observable<O>
}
