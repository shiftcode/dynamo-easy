import { BatchGetRequest, BatchGetResponse } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const keysToFetch: Array<Partial<Person>> = [{ id: 'vogelsw' }]
const otherKeysToFetch: Array<Partial<AnotherModel>> = [{ propA: 'Foo', propB: 'Bar' }]

new BatchGetRequest(new DynamoDB({}))
  .forModel(Person, keysToFetch)
  .forModel(AnotherModel, otherKeysToFetch)
  .exec()
  .then((result: BatchGetResponse) => {
    console.log('items fetched from example table', result.tableNameOfExampleModel)
    console.log('items fetched from another table', result.tableNameOfAnotherModel)
  })
