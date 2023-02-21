import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB({}))
  .transactGet([{ id: 'a' }, { id: 'b' }])
  .exec()
  .then(() => console.log('transactionally read a and b'))
