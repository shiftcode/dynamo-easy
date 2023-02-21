import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from './models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const personStore = new DynamoStore(Person, new DynamoDB({}))
