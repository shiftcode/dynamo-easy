import { TransactGetRequest } from '@shiftcoders/dynamo-easy'
import { AnotherModel, Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new TransactGetRequest(new DynamoDB.DynamoDBClient({}))
  .returnConsumedCapacity(DynamoDB.ReturnConsumedCapacity.TOTAL)
  .forModel(Person, { id: 'vogelsw' })
  .forModel(AnotherModel, { propA: 'Foo', propB: 'Bar' })
  .exec()
  .then((result) => {
    console.log(result[0]) // Person item
    console.log(result[1]) // AnotherModel item
  })
