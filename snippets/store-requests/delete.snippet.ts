import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .delete('vogelsw')
  .onlyIfAttribute('yearOfBirth')
  .lte(1958)
  .exec()
  .then(() => {
    console.log('done')
  })
