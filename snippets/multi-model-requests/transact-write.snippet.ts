import {
  attribute,
  TransactConditionCheck,
  TransactDelete,
  TransactPut,
  TransactUpdate,
  TransactWriteRequest,
} from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const objectToPut: AnotherModel = { propA: 'Foo', propB: 'Bar', updated: new Date() }

new TransactWriteRequest(new DynamoDB({}))
  .transact(
    new TransactConditionCheck(Person, 'vogelsw').onlyIf(attribute('yearOfBirth').gte(1958)),
    new TransactDelete(AnotherModel, 'Foo', 'Bar'),
    new TransactPut(AnotherModel, objectToPut),
    new TransactUpdate(Person, 'vogelsw').updateAttribute('yearOfBirth').set(1984),
  )
  .exec()
  .then(() => console.log('done'))
