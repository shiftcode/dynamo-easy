/**
 * @module expression
 */
import { hasSortKey, Metadata } from '../../decorator/metadata/metadata'
import { attribute } from './logical-operator/public.api'
import { ConditionExpressionDefinitionFunction } from './type/condition-expression-definition-function'

export function createIfNotExistsCondition<T>(metadata: Metadata<T>): ConditionExpressionDefinitionFunction[] {
  const conditionDefFns: ConditionExpressionDefinitionFunction[] = [
    attribute<T>(metadata.getPartitionKey()).attributeNotExists(),
  ]
  if (hasSortKey(metadata)) {
    conditionDefFns.push(attribute<T>(metadata.getSortKey()).attributeNotExists())
  }
  return conditionDefFns
}
