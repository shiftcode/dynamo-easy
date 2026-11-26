import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .batchWrite()
  .delete([{ id: 'a' }, { id: 'b' }])
  .put([{ id: 'vogelsw', name: 'Werner Hans Peter Vogels', yearOfBirth: 1958 }])
  .exec()
  .then(() => {
    console.log('item a, b deleted; werner vogels added')
  })
