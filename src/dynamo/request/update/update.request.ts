import {
  AttributeMap,
  ReturnConsumedCapacity,
  ReturnItemCollectionMetrics,
  UpdateItemOutput,
} from 'aws-sdk/clients/dynamodb'
import { forEach } from 'lodash'
import { Observable } from 'rxjs/Observable'
import { Mapper } from '../../../mapper/mapper'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { and } from '../../expression/logical-operator/and.function'
import { ParamUtil } from '../../expression/param-util'
import { RequestExpressionBuilder } from '../../expression/request-expression-builder'
import { ConditionExpressionDefinitionFunction } from '../../expression/type/condition-expression-definition-function'
import { Expression } from '../../expression/type/expression.type'
import { RequestConditionFunction } from '../../expression/type/request-condition-function'
import { UpdateActionKeyword } from '../../expression/type/update-action-keyword.type'
import { UpdateExpressionDefinitionFunction } from '../../expression/type/update-expression-definition-function'
import { UpdateExpression } from '../../expression/type/update-expression.type'
import { BaseRequest } from '../base.request'

export type Bla = { [key in UpdateActionKeyword]: Expression[] }

// TODO add if no operations are defined, don't execute
export class UpdateRequest<T> extends BaseRequest<T, any> {
  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any
  ) {
    super(dynamoRx, modelClazz, tableName)

    const hasSortKey: boolean = this.metaData.getSortKey() !== null

    if (hasSortKey && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metaData.getSortKey()}`)
    }

    const keyAttributeMap: AttributeMap = {}

    // partition key
    const partitionKeyValue = Mapper.toDbOne(partitionKey, this.metaData.forProperty(this.metaData.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[this.metaData.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey) {
      const sortKeyValue = Mapper.toDbOne(sortKey!, this.metaData.forProperty(this.metaData.getSortKey()!))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[this.metaData.getSortKey()!] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  whereAttribute(attributePath: keyof T): RequestConditionFunction<UpdateRequest<T>> {
    return RequestExpressionBuilder.addCondition('FilterExpression', attributePath, this, this.metaData)
  }

  where(...conditionDefFns: ConditionExpressionDefinitionFunction[]): UpdateRequest<T> {
    const condition = and(...conditionDefFns)(undefined, this.metaData)
    ParamUtil.addExpression('FilterExpression', condition, this.params)
    return this
  }

  /*
   * update()
   * //////////// SET ACTION ////////////
   *  - add one or more attributes to an item
   *  .set('attrPath', value)
   *  - increment / decrement number value (incrementBy(), decrementBy())
   *  .set('attr', value) SET Attr = Attr +- :value
   *  - add a new list / map
   *  .set('attrPath', collectionValue)
   *  - add elements to a list
   *  .set('listAttrPath', itemValue)
   *  - add nested map attributes
   *  .set('', )
   * ///////////  /////////////
   *
   *  //
   *  .
   *  //
   *  .
   *  //
   *  .
   *
   */

  /**
   *
   */
  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateRequest<T> {
    if (updateDefFns && updateDefFns.length) {
      const sortedByActionKeyWord: Bla = updateDefFns
        .map(updateDefFn => {
          return updateDefFn(this.params.ExpressionAttributeValues, this.metaData)
        })
        .reduce(
          (result, expr) => {
            if (!result[expr.type]) {
              result[expr.type] = []
            }

            result[expr.type].push(expr)
            return result
          },
          <Bla>{}
        )

      /*
       * {
       *  SET: [updateExpression, updateExpression]
       * }
       */
      const actionStatements: string[] = []
      let attributeValues: AttributeMap = {}
      let attributeNames: { [key: string]: string } = {}

      forEach(sortedByActionKeyWord, (value: UpdateExpression[], key: UpdateActionKeyword) => {
        const statements: string[] = []
        if (value && value.length) {
          value.forEach(updateExpression => {
            statements.push(updateExpression.statement)
            attributeValues = { ...attributeValues, ...updateExpression.attributeValues }
            attributeNames = { ...attributeNames, ...updateExpression.attributeNames }
          })
          actionStatements.push(`${key} ${statements.join(', ')}`)
        }
      })

      const expression: Expression = {
        statement: actionStatements.join(' '),
        attributeValues,
        attributeNames,
      }

      ParamUtil.addUpdateExpression(expression, this.params)
      return this
    } else {
      throw new Error('at least one update operation must be defined')
    }
  }

  returnConsumedCapacity(level: ReturnConsumedCapacity): UpdateRequest<T> {
    this.params.ReturnConsumedCapacity = level
    return this
  }

  returnItemCollectionMetrics(returnItemCollectionMetrics: ReturnItemCollectionMetrics): UpdateRequest<T> {
    this.params.ReturnItemCollectionMetrics = returnItemCollectionMetrics
    return this
  }

  /*
   * The ReturnValues parameter is used by several DynamoDB operations; however,
   * DeleteItem does not recognize any values other than NONE or ALL_OLD.
   */
  returnValues(returnValues: 'NONE' | 'ALL_OLD' | 'UPDATED_OLD' | 'ALL_NEW' | 'UPDATED_NEW'): UpdateRequest<T> {
    this.params.ReturnValues = returnValues
    return this
  }

  execFullResponse(): Observable<UpdateItemOutput> {
    return this.dynamoRx.updateItem(this.params)
  }

  exec(): Observable<void> {
    // TODO maybe we should map the returned Attributes to the given model type, needs some more investigation
    return this.dynamoRx.updateItem(this.params).map(response => {
      return
    })
  }
}
