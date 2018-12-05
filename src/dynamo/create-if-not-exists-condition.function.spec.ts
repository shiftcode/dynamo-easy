import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../test/models'
import { Metadata, metadataForClass } from '../decorator/metadata'
import { toDb } from '../mapper'
import { createIfNotExistsCondition } from './create-if-not-exists-condition.function'
import { and } from './expression/logical-operator'
import { addExpression } from './expression/param-util'
import { getTableName } from './get-table-name.function'

describe('create ifNotExistsCondition', () => {
  const jsItemSimple: SimpleWithPartitionKeyModel = { id: 'myId-S', age: 20 }
  let metaSimple: Metadata<SimpleWithPartitionKeyModel>
  let paramsSimple: DynamoDB.PutItemInput

  const jsItemComposite: SimpleWithCompositePartitionKeyModel = { id: 'myId-C', creationDate: new Date(), age: 22 }
  let metaComposite: Metadata<SimpleWithCompositePartitionKeyModel>
  let paramsComposite: DynamoDB.PutItemInput

  beforeEach(() => {
    metaSimple = metadataForClass(SimpleWithPartitionKeyModel)
    paramsSimple = {
      TableName: getTableName(metaSimple),
      Item: toDb(jsItemSimple, SimpleWithPartitionKeyModel),
    }
    metaComposite = metadataForClass(SimpleWithCompositePartitionKeyModel)
    paramsComposite = {
      TableName: getTableName(metaComposite),
      Item: toDb(jsItemComposite, SimpleWithCompositePartitionKeyModel),
    }
  })

  it('simple partition key', () => {
    const res = createIfNotExistsCondition(metaSimple)
    const condition = and(...res)(undefined, metaSimple)
    addExpression('ConditionExpression', condition, paramsSimple)

    expect(paramsSimple.ConditionExpression).toBe('(attribute_not_exists (#id))')
    expect(paramsSimple.ExpressionAttributeNames).toEqual({ '#id': 'id' })
    expect(paramsSimple.ExpressionAttributeValues).toBeUndefined()
  })

  it('composite partition key', () => {
    const res = createIfNotExistsCondition(metaComposite)
    const condition = and(...res)(undefined, metaComposite)
    addExpression('ConditionExpression', condition, paramsComposite)

    expect(paramsComposite.ConditionExpression).toBe(
      '(attribute_not_exists (#id) AND attribute_not_exists (#creationDate))',
    )
    expect(paramsComposite.ExpressionAttributeNames).toEqual({ '#id': 'id', '#creationDate': 'creationDate' })
    expect(paramsComposite.ExpressionAttributeValues).toBeUndefined()
  })
})
