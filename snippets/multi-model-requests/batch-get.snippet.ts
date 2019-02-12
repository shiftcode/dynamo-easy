import { BatchGetRequest, BatchGetResponse } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'

const keysToFetch: Array<Partial<Person>> = [{ id: 'vogelsw' }]
const otherKeysToFetch: Array<Partial<AnotherModel>> = [{ propA: 'Foo', propB: 'Bar' }]

new BatchGetRequest()
  .forModel(Person, keysToFetch)
  .forModel(AnotherModel, otherKeysToFetch)
  .exec()
  .then((result: BatchGetResponse) => {
    console.log('items fetched from example table', result.tableNameOfExampleModel)
    console.log('items fetched from another table', result.tableNameOfAnotherModel)
  })
