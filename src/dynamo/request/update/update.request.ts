import { UpdateItemOutput } from 'aws-sdk/clients/dynamodb'
import { forEach } from 'lodash'
import { Observable } from 'rxjs'
import { map, tap } from 'rxjs/operators'
import { hasSortKey } from '../../../decorator/metadata'
import { createLogger, Logger } from '../../../logger/logger'
import { Attributes, toDbOne } from '../../../mapper'
import { ModelConstructor } from '../../../model'
import { DynamoRx } from '../../dynamo-rx'
import { addUpdateExpression } from '../../expression/param-util'
import { Expression, UpdateExpression, UpdateExpressionDefinitionFunction } from '../../expression/type'
import { UpdateActionKeyword } from '../../expression/type/update-action-keyword.type'
import { WriteRequest } from '../write.request'

export type SortedUpdateExpressions = { [key in UpdateActionKeyword]: UpdateExpression[] }

export class UpdateRequest<T> extends WriteRequest<UpdateRequest<T>, T, any> {
  private readonly logger: Logger

  constructor(
    dynamoRx: DynamoRx,
    modelClazz: ModelConstructor<T>,
    tableName: string,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(dynamoRx, modelClazz, tableName)
    this.logger = createLogger('dynamo.request.UpdateRequest', modelClazz)

    if (hasSortKey(this.metadata) && (sortKey === null || sortKey === undefined)) {
      throw new Error(`please provide the sort key for attribute ${this.metadata.getSortKey()}`)
    }

    const keyAttributeMap: Attributes<T> = <any>{}

    // partition key
    const partitionKeyValue = toDbOne(partitionKey, this.metadata.forProperty(this.metadata.getPartitionKey()))

    if (partitionKeyValue === null) {
      throw new Error('please provide an acutal value for partition key, got null')
    }

    keyAttributeMap[this.metadata.getPartitionKey()] = partitionKeyValue

    // sort key
    if (hasSortKey(this.metadata)) {
      const sortKeyValue = toDbOne(sortKey, this.metadata.forProperty(this.metadata.getSortKey()))

      if (sortKeyValue === null) {
        throw new Error('please provide an actual value for sort key, got null')
      }

      keyAttributeMap[this.metadata.getSortKey()] = sortKeyValue
    }

    this.params.Key = keyAttributeMap
  }

  operations(...updateDefFns: UpdateExpressionDefinitionFunction[]): UpdateRequest<T> {
    if (updateDefFns && updateDefFns.length) {
      const sortedByActionKeyWord: SortedUpdateExpressions = updateDefFns
        .map(updateDefFn => {
          return updateDefFn(this.params.ExpressionAttributeValues, this.metadata)
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

  execFullResponse(): Observable<UpdateItemOutput> {
    this.logger.debug('request', this.params)
    return this.dynamoRx.updateItem(this.params).pipe(tap(response => this.logger.debug('response', response)))
  }

  exec(): Observable<void> {
    return this.execFullResponse().pipe(
      map(response => {
        return
      }),
    )
  }
}
