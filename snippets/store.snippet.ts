import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from './models'

const personStore = new DynamoStore(Person)
