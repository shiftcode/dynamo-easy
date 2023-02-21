import { BatchWriteRequest } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'
import { DynamoDB, ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb'

const keysToDelete: Array<Partial<Person>> = [{ id: 'vogelsw' }]
const otherKeysToDelete: Array<Partial<AnotherModel>> = [{ propA: 'Foo', propB: 'Bar' }]
const objectsToPut: AnotherModel[] = [
  { propA: 'foo', propB: 'bar', updated: new Date() },
  { propA: 'foo2', propB: 'bar2', updated: new Date() },
]

new BatchWriteRequest(new DynamoDB({}))
  .returnConsumedCapacity(ReturnConsumedCapacity.TOTAL)
  .delete(Person, keysToDelete)
  .delete(AnotherModel, otherKeysToDelete)
  .put(AnotherModel, objectsToPut)
  .execFullResponse()
  .then(resp => {
    console.log(resp.ConsumedCapacity)
  })
