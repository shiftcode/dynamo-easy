import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .transactGet([{ id: 'a' }, { id: 'b' }])
  .exec()
  .then(() => {
    console.log('transactionally read a and b')
  })
