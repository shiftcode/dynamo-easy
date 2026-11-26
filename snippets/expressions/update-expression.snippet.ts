import { DynamoStore, update } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

const personStore = new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
personStore.update('vogelsw').operations(update('name').set('Werner Vogels'), update('yearOfBirth').set(1984))
