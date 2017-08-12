import { PutItemInput, BatchGetItemInput, DeleteItemInput, AttributeMap } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs/Observable'
import { MetadataHelper } from './decorators/metadata'
import { DynamoRx } from './dynamo-rx'
import { Mapper } from './mapper/mapper'
import { QueryRequest } from './requests/query/query-request'
import { ScanRequest } from './requests/scan/scan-request'
import { ModelClass } from './model/model'
import * as Debug from 'debug'

export class DynamoStore<T> {
  private readonly debug: Debug.IDebugger = Debug('dynamo-store')
  private readonly dynamoRx: DynamoRx
  private readonly tableName: string
  private readonly mapper: Mapper

  constructor(logger: Logger, private modelClazz: ModelClass<T>) {
    this.dynamoRx = new DynamoRx()
    this.tableName = MetadataHelper.get(this.modelClazz).modelOptions.tableName
  }

  put(item: T, ifNotExists?: boolean): Observable<void> {
    let params: any = Object.assign({}, this.createBaseParams(), {
      Item: Mapper.mapToDb(item, this.modelClazz)
    })

    // FIXME add ifNotExists condition
    return this.dynamoRx.putItem(params).map(() => {
      return
    })
  }

  find(): Observable<T[]> {
    return this.scan().exec()
  }

  /*
  findById(id: any): Observable<T> {
    return this.query()
      .wherePartitionKey(id)
      .execSingle()
  }
  */

  /*
  findByIds(ids: any[]): Observable<T[]> {
    let requestItems: { [nameDb: string]: { Keys: AttributeMap[] } } = {};
    let keys: AttributeMap[] = [];
    ids.forEach(id => {
      let idOb: AttributeMap = {};
      idOb[this.schema.partitionKey] = this.mapper.mapAttributeToDb(id, 'id', <NestedSchema<T>>this.schema);
      keys.push(idOb);
    });

    requestItems[this.tableName] = {
      Keys: keys,
    };

    let params: BatchGetItemInput = {
      RequestItems: requestItems,
    };

    return this.dynamoRx.batchGetItems(params)
      .map(response => _.map(response.Responses[this.tableName], (item => SchemaUtil.mapFromDb(item, <NestedSchema<T>>this.schema))));
  }
  */

  /*
  deleteById(hashKey: any, rangeKey?: any): Observable<void> {
    let params: DeleteItemInput = {
      TableName: this.tableName,
      Key: Mapper.buildKey(hashKey, this.schema, rangeKey),
    };

    return this.dynamoRx.deleteItem(params)
      .map(() => null);
  }
  */

  scan(): ScanRequest<T> {
    return new ScanRequest<T>(this.dynamoRx, this.modelClazz)
  }

  query(): QueryRequest<T> {
    return new QueryRequest(this.dynamoRx, this.modelClazz)
  }

  makeRequest<Z>(operation: string, params?: { [key: string]: any }): Observable<Z> {
    this.debug('makeRequest')
    return this.dynamoRx.makeRequest(operation, params)
  }

  private createBaseParams(): { TableName: string } {
    let params: { TableName: string } = {
      TableName: this.tableName
    }

    return params
  }
}
