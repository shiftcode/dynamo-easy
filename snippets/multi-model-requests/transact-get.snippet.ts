import { TransactGetRequest } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'
import { DynamoDB, ReturnConsumedCapacity } from '@aws-sdk/client-dynamodb'

new TransactGetRequest(new DynamoDB({}))
  .returnConsumedCapacity(ReturnConsumedCapacity.TOTAL)
  .forModel(Person, { id: 'vogelsw' })
  .forModel(AnotherModel, { propA: 'Foo', propB: 'Bar' })
  .exec()
  .then(result => {
    console.log(result[0]) // Person item
    console.log(result[1]) // AnotherModel item
  })
