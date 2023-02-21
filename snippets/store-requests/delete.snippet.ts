import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB({}))
  .delete('vogelsw')
  .onlyIfAttribute('yearOfBirth').lte(1958)
  .exec()
  .then(() => console.log('done'))
