import { DynamoStore } from '@shiftcoders/dynamo-easy'
import { Person } from '../models'
import * as DynamoDB from '@aws-sdk/client-dynamodb'

new DynamoStore(Person, new DynamoDB.DynamoDBClient({}))
  .get('wernerv') // returns an instance of GetRequest
  .consistentRead(true) // sets params.ConsistentRead = true
  .exec() // returns a Promise<Person|null>
  .then((obj) => {
    console.log(obj)
  })
