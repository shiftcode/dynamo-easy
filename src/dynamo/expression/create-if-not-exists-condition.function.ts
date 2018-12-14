import { hasSortKey, Metadata } from '../../decorator/metadata/index'
import { attribute } from './logical-operator/index'
import { ConditionExpressionDefinitionFunction } from './type/index'

export function createIfNotExistsCondition<T>(metadata: Metadata<T>): ConditionExpressionDefinitionFunction[] {
  const conditionDefFns: ConditionExpressionDefinitionFunction[] = [
    attribute<T>(metadata.getPartitionKey()).attributeNotExists(),
  ]
  if (hasSortKey(metadata)) {
    conditionDefFns.push(attribute<T>(metadata.getSortKey()).attributeNotExists())
  }
  return conditionDefFns
}
