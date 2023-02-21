import { attribute, DynamoStore, or, update } from '@shiftcoders/dynamo-easy'
import { AnotherModel } from '../models'
import { DynamoDB } from '@aws-sdk/client-dynamodb'

const index = 3
const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60)

new DynamoStore(AnotherModel, new DynamoDB({}))
  .update('myPartitionKey', 'mySortKey')
  .operations(
    update(`myNestedList[${index}].propertyX`).set('value'),
    update('updated').set(new Date()),
  )
  .onlyIf(
    or(
      attribute('id').attributeNotExists(), // item not existing
      attribute('updated').lt(oneHourAgo), // or was not updated in the last hour
    ),
  )
  .returnValues('ALL_OLD')
  .exec()
  .then(oldVal => console.log('old value was:', oldVal))
