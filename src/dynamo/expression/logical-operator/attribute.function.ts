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

export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain
export function attribute(attributePath: string): ConditionExpressionDefinitionChain

export function attribute<T>(attributePath: keyof T): ConditionExpressionDefinitionChain {
  return RequestExpressionBuilder.propertyDefinitionFunction<T>(attributePath)
}
