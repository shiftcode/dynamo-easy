import { DynamoStore, update } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const personStore = new DynamoStore(Person, new DynamoDB({}))
personStore.update('vogelsw')
  .operations(
    update('name').set('Werner Vogels'),
    update('yearOfBirth').set(1984),
  )
