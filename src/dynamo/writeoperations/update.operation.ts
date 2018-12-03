import { forEach } from 'lodash'
import { hasSortKey } from '../../decorator/metadata/metadata'
import { Attribute, Attributes, toDbOne } from '../../mapper'
import { ModelConstructor } from '../../model'
import { addUpdateExpression } from '../expression/param-util'
import { Expression, UpdateExpressionDefinitionFunction } from '../expression/type'
import { SortedUpdateExpressions } from '../request/update/update.request'
import { WriteOperation } from './write-operation'
import { UpdateOperationParams } from './write-operation-params.type'

export class UpdateOperation<T> extends WriteOperation<T, UpdateOperationParams<T>, UpdateOperation<T>> {

  constructor(
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(modelClazz, tableName)

    const partitionKeyProp = this.metadata.getPartitionKey()

    const keyAttributeMap = <Attributes<Partial<T>>>{
      [partitionKeyProp]: toDbOne(partitionKey, this.metadata.forProperty(partitionKeyProp)),
    }

    if (hasSortKey(this.metadata)) {
      if (sortKey === null || sortKey === undefined) {
        throw new Error(`please provide the sort key for attribute ${this.metadata.getSortKey()}`)
      }
      const sortKeyProp = this.metadata.getSortKey()
      keyAttributeMap[sortKeyProp] = <Attribute>toDbOne(sortKey, this.metadata.forProperty(sortKeyProp))
    }

    this.params.Key = keyAttributeMap

  }


  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateOperation<T> {
    if (updateDefFns && updateDefFns.length) {
      const sortedByActionKeyWord: SortedUpdateExpressions = updateDefFns
        .map(updateDefFn => {
          return updateDefFn(<any>this.params.ExpressionAttributeValues, this.metadata)
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

      addUpdateExpression(expression, this.params)
      return this
    } else {
      throw new Error('at least one update operation must be defined')
    }
  }

}
