import {DynamoDB} from '@aws-sdk/client-dynamodb'
import { attribute2, DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'

const personStore = new DynamoStore(Person, new DynamoDB({}))

personStore.delete('volgelsw')
  .onlyIf(
    attribute2(Person, 'yearOfBirth').eq(1958),
  )
