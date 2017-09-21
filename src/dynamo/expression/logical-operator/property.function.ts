import { ExpressionAttributeValueMap } from 'aws-sdk/clients/dynamodb'
import { curry } from 'lodash'
import { Metadata } from '../../../decorator/metadata/metadata'
import { PropertyMetadata } from '../../../decorator/metadata/property-metadata.model'
import { AttributeType } from '../../../mapper/type/attribute.type'
import { ConditionExpressionBuilder } from '../condition-expression-builder'
import { RequestExpressionBuilder } from '../request-expression-builder'
import { ConditionExpressionChain } from '../type/condition-expression-chain'
import { ConditionExpressionDefinitionChain } from '../type/condition-expression-definition-chain'
import { ConditionExpressionDefinitionFunction } from '../type/condition-expression-definition-function'
import { ConditionExpression } from '../type/condition-expression.type'
import { ConditionOperator } from '../type/condition-operator.type'

/*
 * TODO review this comment
 *
 * because we curry the ConditionExpressionBuilder.buildFilterExpression function we cannot support optional parameters, because
 * the curry function needs to know when all arguments are provided to actually execute the function.
 *
 * for convenienve we could add another property fn like where0 which could accept no arguments for existingValueNames and metadata
 *
 * maybe we wanna provide another property function where0 or similar with a fixed a
 */
export function property<T>(keyName: keyof T): ConditionExpressionDefinitionChain
export function property(keyName: string): ConditionExpressionDefinitionChain

export function property<T>(keyName: keyof T): ConditionExpressionDefinitionChain {
  return RequestExpressionBuilder.propertyDefinitionFunction<T>(keyName)
}
