/**
 * @module store-requests
 */
import * as DynamoDB from 'aws-sdk/clients/dynamodb'

export interface ScanResponse<T> {
  /**
   * An array of item attributes that match the scan criteria. Each element in this array consists of an attribute name and the value for that attribute.
   */
  Items: T[]
  /**
   * The number of items in the response. If you set ScanFilter in the request, then Count is the number of items returned after the filter was applied, and ScannedCount is the number of matching items before the filter was applied. If you did not use a filter in the request, then Count is the same as ScannedCount.
   */
  Count: DynamoDB.Integer
  /**
   * The number of items evaluated, before any ScanFilter is applied. A high ScannedCount value with few, or no, Count results indicates an inefficient Scan operation. For more information, see Count and ScannedCount in the Amazon DynamoDB Developer Guide. If you did not use a filter in the request, then ScannedCount is the same as Count.
   */
  ScannedCount?: DynamoDB.Integer
  /**
   * The primary key of the item where the operation stopped, inclusive of the previous result set. Use this value to start a new operation, excluding this value in the new request. If LastEvaluatedKey is empty, then the "last page" of results has been processed and there is no more data to be retrieved. If LastEvaluatedKey is not empty, it does not necessarily mean that there is more data in the result set. The only way to know when you have reached the end of the result set is when LastEvaluatedKey is empty.
   */
  LastEvaluatedKey?: DynamoDB.Key
  /**
   * The capacity units consumed by the Scan operation. The data returned includes the total provisioned throughput consumed, along with statistics for the table and any indexes involved in the operation. ConsumedCapacity is only returned if the ReturnConsumedCapacity parameter was specified. For more information, see Provisioned Throughput in the Amazon DynamoDB Developer Guide.
   */
  ConsumedCapacity?: DynamoDB.ConsumedCapacity
}
