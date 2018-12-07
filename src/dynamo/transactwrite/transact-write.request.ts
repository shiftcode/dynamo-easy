import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { DynamoRx } from '../dynamo-rx'
import { TransactOperation } from './transact-operation.type'


export class TransactWriteRequest {
  readonly params: DynamoDB.TransactWriteItemsInput
  private readonly dynamoRx: DynamoRx

  constructor() {
    this.dynamoRx = new DynamoRx()
    this.params = {
      TransactItems: [],
    }
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactWriteRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: DynamoDB.ReturnItemCollectionMetrics): TransactWriteRequest {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  transact(...writeOperations: TransactOperation[]): TransactWriteRequest {
    if (!writeOperations || writeOperations.length === 0) {
      throw new Error('at least one transaction operation must be added')
    }
    if ((this.params.TransactItems.length + writeOperations.length) > 10) {
      throw new Error(`Each transaction can include up to 10 unique items, including conditions.\
       Given operations count: ${this.params.TransactItems.length + writeOperations.length}`)
    }
    this.params.TransactItems.push(...writeOperations.map(wo => wo.transactItem))
    return this
  }

  execFullResponse(): Observable<DynamoDB.TransactWriteItemsOutput> {
    return this.dynamoRx.transactWriteItems(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.transactWriteItems(this.params).pipe(
      map(response => {
        return
      }),
    )
  }
}
