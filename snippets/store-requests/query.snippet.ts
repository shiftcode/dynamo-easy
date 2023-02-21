import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { AnotherModel } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

new DynamoStore(AnotherModel, new DynamoDB({}))
  .query()
  .wherePartitionKey('2018-01')
  .whereSortKey().beginsWith('a')
  .execSingle()
  .then(r => console.log('first found item:', r))
