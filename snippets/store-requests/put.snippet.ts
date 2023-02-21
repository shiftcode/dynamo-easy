import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const objectToPut: Person = {
  id: 'vogelsw',
  name: 'Werner Hans Peter Vogels',
  yearOfBirth: 1958,
} // object literal or new Person(...)

new DynamoStore(Person, new DynamoDB({}))
  .put(objectToPut)
  .ifNotExists()
  .exec()
  .then(() => console.log('done'))
