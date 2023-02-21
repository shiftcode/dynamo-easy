import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { AnotherModel } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)

new DynamoStore(AnotherModel, new DynamoDB({}))
  .update('myPartitionKey', 'mySortKey')
  .updateAttribute('propC').set('newValue')
  .updateAttribute('updated').set(new Date())
  .onlyIfAttribute('updated').lt(oneHourAgo)
  .exec()
  .then(() => console.log('done'))
