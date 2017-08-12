import { QueryInput } from 'aws-sdk/clients/dynamodb'
import * as _ from 'lodash'
import { Observable } from 'rxjs/Observable'
import { DynamoRx } from '../../dynamo-rx'
import { Request } from '../request.model'
import { MetadataHelper } from '../../decorators/metadata'
import { Response } from '../response.model'

// inspired by https://github.com/ryanfitz/vogels/blob/master/lib/query.js
export class QueryRequest<T> extends Request<T> {
  constructor(dynamoRx: DynamoRx, modelClazz: { new (): T }) {
    super(dynamoRx, modelClazz)
  }

  limit(limit: number = Request.DEFAULT_LIMIT): QueryRequest<T> {
    if (limit === Request.INFINITE_LIMIT) {
      delete this.params.Limit
    } else {
      this.params.Limit = limit
    }

    return this
  }

  // index(indexName: string): QueryRequest<T> {
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

  ascending(): QueryRequest<T> {
    ;(<QueryInput>this.params).ScanIndexForward = true
    return this
  }

  descending(): QueryRequest<T> {
    ;(<QueryInput>this.params).ScanIndexForward = false
    return this
  }

  // FIXME implement
  // wherePartitionKey(partitionKeyValue: any): QueryRequest<T> {
  //   let partitionKey: string;
  //   if (this.params.IndexName) {
  //     if (this.schema.indexes && this.schema.indexes[this.params.IndexName]) {
  //       partitionKey = this.schema.indexes[this.params.IndexName].partitionKey;
  //       if (!partitionKey) {
  //         throw new Error(`there is no parition key defined for index <${this.params.IndexName}>`);
  //       }
  //     } else {
  //       throw new Error(`please add the index <${this.params.IndexName}> to the schema using the schema constructor`);
  //     }
  //   } else {
  //     partitionKey = this.schema.partitionKey;
  //   }
  //
  //   return ConditionBuilder.addKeyCondition<QueryRequest<T>>(partitionKey, this).equals(partitionKeyValue);
  // }

  /**
   * used to define some condition for the range key, use the secondary index to query based on a custom index
   * @returns {ConditionFunction<T>}
   */
  // FIXME implmenet
  // whereSortKey(): RangeKeyConditionFunction<QueryRequest<T>> {
  //   let sortKey: string;
  //   if (this.params.IndexName) {
  //     sortKey = this.schema.indexes[this.params.IndexName].sortKey;
  //   } else {
  //     sortKey = this.schema.sortKey;
  //   }
  //
  //   if (!sortKey) {
  //     throw new Error('There was no sort key defined for current schema');
  //   }
  //
  //   return ConditionBuilder.addKeyCondition(sortKey, this);
  // }

  // FIXME implement
  // where(keyName: string): ConditionFunction<QueryRequest<T>> {
  //   return ConditionBuilder.addCondition(keyName, this);
  // }

  execCount(): Observable<number> {
    let params = _.clone(this.params)
    params.Select = 'COUNT'

    return this.dynamoRx.query(params).map(response => response.Count)
  }

  execNoMap(): Observable<Response<T>> {
    return this.dynamoRx.query(this.params).map(queryResponse => {
      let response: Response<T> = {}
      Object.assign(response, queryResponse)
      response.Items = queryResponse.Items.map(item => this.mapFromDb(<any>item))

      return response
    })
  }

  exec(): Observable<T[]> {
    return this.dynamoRx.query(this.params).map(response => response.Items.map(item => this.mapFromDb(<any>item)))
  }

  execSingle(): Observable<T> {
    this.limit(1)

    return this.dynamoRx.query(this.params).map(response => this.mapFromDb(<any>response.Items[0]))
  }
}
