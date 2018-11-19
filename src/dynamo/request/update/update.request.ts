import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { forEach } from 'lodash'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Mapper } from '../../../mapper/mapper'
import { Attributes } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model/model-constructor'
import { DynamoRx } from '../../dynamo-rx'
import { ParamUtil } from '../../expression/param-util'
import { Expression } from '../../expression/type/expression.type'
import { UpdateActionKeyword } from '../../expression/type/update-action-keyword.type'
import { UpdateExpressionDefinitionFunction } from '../../expression/type/update-expression-definition-function'
import { UpdateExpression } from '../../expression/type/update-expression.type'
import { WriteRequest } from '../write.request'

export type SortedUpdateExpressions = { [key in UpdateActionKeyword]: UpdateExpression[] }

export class UpdateRequest<T> extends WriteRequest<UpdateRequest<T>, T, any> {
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

    const keyAttributeMap: Attributes = {}

    // partition key
    const partitionKeyValue = Mapper.toDbOne(partitionKey, this.metaData.forProperty(this.metaData.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[<string>this.metaData.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey) {
      const sortKeyValue = Mapper.toDbOne(sortKey!, this.metaData.forProperty(this.metaData.getSortKey()!))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[<string>this.metaData.getSortKey()!] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateRequest<T> {
    if (updateDefFns && updateDefFns.length) {
      const sortedByActionKeyWord: SortedUpdateExpressions = updateDefFns
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
          <SortedUpdateExpressions>{}
        )

      const actionStatements: string[] = []
      let attributeValues: Attributes = {}
      let attributeNames: { [key: string]: string } = {}

      forEach(sortedByActionKeyWord, (value, key) => {
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

  execFullResponse(): Observable<UpdateItemOutput> {
    return this.dynamoRx.updateItem(this.params)
  }

  exec(): Observable<void> {
    return this.dynamoRx.updateItem(this.params).pipe(
      map(response => {
        return
      })
    )
  }
}
