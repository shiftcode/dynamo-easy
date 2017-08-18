import { QueryInput, QueryOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { ComplexModel } from '../../../test/models/complex.model'
import { DynamoRx } from '../../dynamo/dynamo-rx'
import { QueryRequest } from './query-request'

const DYNAMO_RX_MOCK = {
  query(params: QueryInput): Observable<QueryOutput> {
    console.log(params)
    return Observable.of({})
  },
}

xdescribe('query request', () => {
  describe('defines correct params', () => {
    let request: QueryRequest<ComplexModel>
    beforeEach(() => {
      request = new QueryRequest(null, ComplexModel)
    })
    it('defaults should be defined', () => {
      expect(request.params.TableName).toBe('complex_model')
      expect(request.params.Limit).toBe(QueryRequest.DEFAULT_LIMIT)
    })

    it('Limit', () => {
      request.limit(5)
      expect(request.params).toBeDefined()
      expect(request.params.Limit).toBe(5)
    })
  })

  describe('calls endpoint with correct params', () => {
    const dynamoRx: DynamoRx = DYNAMO_RX_MOCK as DynamoRx
    let querySpy

    let request: QueryRequest<ComplexModel>

    beforeEach(() => {
      request = new QueryRequest(null, ComplexModel)
      querySpy = spyOn(dynamoRx, 'query').and.callThrough()
    })

    it('partition key', () => {})
  })
})
