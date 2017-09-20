import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { curry } from 'lodash'
import { Metadata } from '../../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../../decorator/metadata/property-metadata.model'
import { AttributeType } from '../../../mapper/type/attribute.type'
import { ConditionBuilder } from '../condition-builder'
import { Expressions } from '../expressions'
import { ConditionFunction } from '../type/condition-function'
import { ConditionOperator } from '../type/condition-operator.type'
import { Condition } from '../type/condition.type'

/*
 * because we curry the Expressions.buildFilterExpression function we cannot support optional parameters, because
 * the curry function needs to know when all arguments are provided to actually execute the function.
 *
 * for convenienve we could add another where fn like where0 which could accept no arguments for existingValueNames and metadata
 *
 *  maybe we wanna provide another where function where0 or similar with a fixed a
 */
export function property<T>(keyName: keyof T): ConditionDefinitionFunction
export function property(keyName: string): ConditionDefinitionFunction

export function property<T>(keyName: keyof T): ConditionDefinitionFunction {
  const f = (operator: ConditionOperator) => {
    return (...values: any[]): ConditionDefFn => {
      const copy = [...values]
      const curried = curry<string, ConditionOperator, any[], string[], Metadata<any>, Condition>(
        Expressions.buildFilterExpression
      )
      return curried(keyName, operator, values)
    }
  }

  // TODO move out of call is always the same, static member
  return ConditionBuilder.createConditionFunctions<ConditionDefinitionFunction>(f)
}

// (expressionAttributeValues?: ExpressionAttributeValueMap, propertyMetadata?: PropertyMetadata<any>) => Condition
export type ConditionDefFn = (
  expressionAttributeValues: string[] | undefined,
  metadata: Metadata<any> | undefined
) => Condition

export interface ConditionDefinitionFunction {
  equals: (value: any) => ConditionDefFn
  eq: (value: any) => ConditionDefFn
  ne: (value: any) => ConditionDefFn
  lte: (value: any) => ConditionDefFn
  lt: (value: any) => ConditionDefFn
  gte: (value: any) => ConditionDefFn
  gt: (value: any) => ConditionDefFn
  null: () => ConditionDefFn
  notNull: () => ConditionDefFn
  contains: (value: any) => ConditionDefFn
  notContains: (value: any) => ConditionDefFn
  type: (value: AttributeType) => ConditionDefFn
  in: (value: any[]) => ConditionDefFn
  beginsWith: (value: any) => ConditionDefFn
  between: (value1: any, value2: any) => ConditionDefFn
}
