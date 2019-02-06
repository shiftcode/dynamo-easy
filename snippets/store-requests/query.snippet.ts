import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { AnotherModel } from '../models'

new DynamoStore(AnotherModel)
  .query()
  .wherePartitionKey('2018-01')
  .whereSortKey().beginsWith('a')
  .execSingle()
  .then(r => console.log('first found item:', r))
