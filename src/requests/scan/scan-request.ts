import { Observable } from 'rxjs/Observable'
import { Request } from '../request.model'
import { Response } from '../response.model'
import { DynamoRx } from '../../dynamo/dynamo-rx'

// inspired by https://github.com/ryanfitz/vogels/blob/master/lib/scan.js
export class ScanRequest<T> extends Request<T> {
  constructor(dynamoRx: DynamoRx, modelClazz: { new (): T }) {
    super(dynamoRx, modelClazz)
  }

  limit(limit: number = Request.DEFAULT_LIMIT): Request<T> {
    if (limit === Request.INFINITE_LIMIT) {
      delete this.params.Limit
    } else {
      this.params.Limit = limit
    }

    return this
  }

  // index(indexName: string): Request<T> {
  //   let indexes: IModelAttributeIndex[] = Metadata.getIndexes(this.modelClazz);
  //
  //   // FIXME implement
  //   if (indexes[indexName]) {
  //     this.params.IndexName = indexName;
  //   } else {
  //     throw new Error(`there is no index with name <${indexName}> defined on the schema`);
  //   }
  //   return this;
  // }

  // where(keyName: string): ConditionFunction<ScanRequest<T>> {
  //   return ConditionBuilder.addCondition<ScanRequest<T>>(keyName, this);
  // }

  execNoMap(): Observable<Response<T>> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).map(queryResponse => {
      let response: Response<T> = {}
      Object.assign(response, queryResponse)
      response.Items = queryResponse.Items.map(item => this.mapFromDb(<any>item))

      return response
    })
  }

  exec(): Observable<T[]> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).map(response => response.Items.map(item => this.mapFromDb(<any>item)))
  }

  execSingle(): Observable<T | null> {
    delete this.params.Select

    return this.dynamoRx.scan(this.params).map(response => this.mapFromDb(<any>response.Items[0]))
  }

  execCount(): Observable<number> {
    let params = { ...this.params }
    params.Select = 'COUNT'

    return this.dynamoRx.scan(params).map(response => response.Count)
  }
}
