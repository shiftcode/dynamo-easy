import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { forEach } from 'lodash'
import { Metadata } from '../../decorator/metadata/index'
import { Attributes } from '../../mapper/index'
import { SortedUpdateExpressions } from '../request/update/update.request'
import { addUpdateExpression } from './param-util'
import { Expression, UpdateExpressionDefinitionFunction } from './type/index'

export function prepareAndAddUpdateExpressions(
  metadata: Metadata<any>,
  params: DynamoDB.UpdateItemInput | DynamoDB.Update,
  updateDefFns: UpdateExpressionDefinitionFunction[],
) {
  if (updateDefFns && updateDefFns.length) {
    const sortedByActionKeyWord: SortedUpdateExpressions = updateDefFns
      .map(updateDefFn => {
        return updateDefFn(<any>params.ExpressionAttributeNames, metadata)
      })
      .reduce(
        (result, expr) => {
          if (!result[expr.type]) {
            result[expr.type] = []
          }

          result[expr.type].push(expr)
          return result
        },
        <SortedUpdateExpressions>{},
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

    addUpdateExpression(expression, params)
  } else {
    throw new Error('at least one update operation must be defined')
  }
}
