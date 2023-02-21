import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from './models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const personStore = new DynamoStore(Person, new DynamoDB({}))

personStore
  .scan()
  .whereAttribute('yearOfBirth').equals(1958)
  .exec()
  .then(res => console.log('ALL items with yearOfBirth == 1958', res))
