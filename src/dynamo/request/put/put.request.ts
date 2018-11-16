import { PutItemOutput } from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { attribute } from '../../expression/logical-operator/attribute.function'
import { WriteRequest } from '../write.request'

export class PutRequest<T> extends WriteRequest<PutRequest<T>, T, any> {
  constructor(dynamoRx: DynamoRx, modelClazz: ModelConstructor<T>, tableName: string, item: T) {
    super(dynamoRx, modelClazz, tableName)
    this.params.Item = Mapper.toDb(item, this.modelClazz)
  }

  protected getInstance(): PutRequest<T> {
    return this
  }

  /**
   * Adds a condition expression to the request, which makes sure the item will only be saved if the id does not exist
   * @returns {PutRequest<T>}
   */
  ifNotExists(predicate?: boolean): PutRequest<T> {
    // FIXME should we check for sort key too?
    const conditionDefFns = []
    if (predicate === undefined || (predicate !== undefined && predicate === true)) {
      conditionDefFns.push(attribute<T>(this.metaData.getPartitionKey()).attributeNotExists())

      const sortKey = this.metaData.getSortKey()
      if (sortKey !== null) {
        conditionDefFns.push(attribute<T>(sortKey).attributeNotExists())
      }

      this.onlyIf(...conditionDefFns)
    }

    return this
  }

  execFullResponse(): Observable<PutItemOutput> {
    return this.dynamoRx.putItem(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.putItem(this.params).pipe(
      map(response => {
        return
      })
    )
  }
}
