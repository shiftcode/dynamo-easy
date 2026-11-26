/**
 * @module multi-model-requests/transact-write
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { TransactOperation } from './transact-operation.type'

/**
 * Request class for the TransactWriteItems operation. Write up to 25 items to one or many tables in a transaction.
 */
export class TransactWriteRequest {
  readonly params: DynamoDB.TransactWriteItemsInput & { TransactItems: DynamoDB.TransactWriteItem[] }

  constructor(readonly client: DynamoDB.DynamoDBClient) {
    this.params = {
      TransactItems: [],
    }
  }

  /**
   * return ConsumedCapacity of the corresponding table(s) in the response
   */
  returnConsumedCapacity(level: DynamoDB.ReturnConsumedCapacity): this {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  /**
   * return item collection metrics.
   */
  returnItemCollectionMetrics(returnItemCollectionMetrics: DynamoDB.ReturnItemCollectionMetrics): this {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /**
   * add up to 25 transaction operations
   * create the operations with:
   * {@link TransactConditionCheck}, {@link TransactDelete}, {@link TransactPut}, {@link TransactUpdate}
   */
  transact(...writeOperations: TransactOperation[]): this {
    if (!writeOperations || writeOperations.length === 0) {
      throw new Error('at least one transaction operation must be added')
    }
    if (this.params.TransactItems.length + writeOperations.length > 25) {
      throw new Error(`Each transaction can include up to 25 unique items, including conditions.\
       Given operations count: ${this.params.TransactItems.length + writeOperations.length}`)
    }
    this.params.TransactItems.push(...writeOperations.map((wo) => wo.transactItem))
    return this
  }

  /**
   * execute the request and return the full reponse.
   */
  execFullResponse(): Promise<DynamoDB.TransactWriteItemsCommandOutput> {
    return this.client.send(new DynamoDB.TransactWriteItemsCommand(this.params))
  }

  /**
   * execute the request.
   */
  exec(): Promise<void> {
    return this.client.send(new DynamoDB.TransactWriteItemsCommand(this.params)).then(() => {
      return
    })
  }
}
