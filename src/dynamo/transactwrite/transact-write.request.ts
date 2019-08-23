/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { DynamoDbWrapper } from '../dynamo-db-wrapper'
import { TransactOperation } from './transact-operation.type'

/**
 * Request class for the TransactWriteItems operation. Write up to 10 items to one or many tables in a transaction.
 */
export class TransactWriteRequest {
  get dynamoDB(): DynamoDB {
    return this.dynamoDBWrapper.dynamoDB
  }

  readonly params: DynamoDB.TransactWriteItemsInput
  private readonly dynamoDBWrapper: DynamoDbWrapper

  constructor(dynamoDB?: DynamoDB) {
    this.dynamoDBWrapper = new DynamoDbWrapper(dynamoDB)
    this.params = {
      TransactItems: [],
    }
  }

  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): TransactWriteRequest {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  /**
   * return item collection metrics.
   */
  returnItemCollectionMetrics(returnItemCollectionMetrics: DynamoDB.ReturnItemCollectionMetrics): TransactWriteRequest {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  transact(...writeOperations: TransactOperation[]): TransactWriteRequest {
    if (!writeOperations || writeOperations.length === 0) {
      throw new Error('at least one transaction operation must be added')
    }
    if (this.params.TransactItems.length + writeOperations.length > 10) {
      throw new Error(`Each transaction can include up to 10 unique items, including conditions.\
       Given operations count: ${this.params.TransactItems.length + writeOperations.length}`)
    }
    this.params.TransactItems.push(...writeOperations.map(wo => wo.transactItem))
    return this
  }

  /**
   * execute the request and return the full reponse.
   */
  execFullResponse(): Promise<DynamoDB.TransactWriteItemsOutput> {
    return this.dynamoDBWrapper.transactWriteItems(this.params)
  }

  /**
   * execute the request.
   */
  exec(): Promise<void> {
    return this.dynamoDBWrapper.transactWriteItems(this.params).then(response => {
      return
    })
  }
}
