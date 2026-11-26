import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

const objectToPut: Person = {
  id: 'vogelsw',
  name: 'Werner Hans Peter Vogels',
  yearOfBirth: 1958,
} // object literal or new Person(...)

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .put(objectToPut)
  .ifNotExists()
  .exec()
  .then(() => {
    console.log('done')
  })
