import { AttributeMap, ReturnConsumedCapacity } from 'aws-sdk/clients/dynamodb'
import { values as objValues } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { resolveAttributeNames } from '../../expression/functions/attribute-names.function'
import { BaseRequest } from '../base.request'
import { GetResponse } from './get.response'

export class GetRequest<T> extends BaseRequest<T, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(dynamoRx, modelClazz)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if (hasSortKey && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metaData.getSortKey()}`)
    }

    const keyAttributeMap: AttributeMap = {}

    // partition key
    keyAttributeMap[this.metaData.getPartitionKey()] = Mapper.toDbOne(
      partitionKey,
      this.metaData.forProperty(this.metaData.getPartitionKey())
    )

    // sort key
    if (hasSortKey) {
      keyAttributeMap[this.metaData.getSortKey()!] = Mapper.toDbOne(
        sortKey!,
        this.metaData.forProperty(this.metaData.getSortKey()!)
      )
    }

    this.params.Key = keyAttributeMap
  }

  consistentRead(consistendRead: boolean): GetRequest<T> {
    this.params.ConsistentRead = consistendRead
    return this
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): GetRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  // TODO review this
  projectionExpression(...attributesToGet: string[]): GetRequest<T> {
    const resolved = attributesToGet.map(attr => resolveAttributeNames(attr))
    this.params.ProjectionExpression = resolved.map(attr => attr.placeholder).join(', ')
    objValues(resolved).forEach(r => {
      this.params.ExpressionAttributeNames = { ...this.params.ExpressionAttributeNames, ...r.attributeNames }
    })
    return this
  }

  execFullResponse(): Observable<GetResponse<T>> {
    return this.dynamoRx.getItem(this.params).map(getItemResponse => {
      const response: GetResponse<T> = <any>{ ...getItemResponse }

      if (getItemResponse.Item) {
        response.Item = Mapper.fromDb(getItemResponse.Item, this.modelClazz)
      } else {
        response.Item = null
      }

      return response
    })
  }

  exec(): Observable<T | null> {
    return this.dynamoRx.getItem(this.params).map(response => {
      if (response.Item) {
        return Mapper.fromDb(response.Item, this.modelClazz)
      } else {
        return null
      }
    })
  }
}
