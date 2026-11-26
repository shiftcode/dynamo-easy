import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .batchGet([{ id: 'a' }, { id: 'b' }])
  .exec()
  .then((res) => {
    console.log('fetched items:', res)
  })
