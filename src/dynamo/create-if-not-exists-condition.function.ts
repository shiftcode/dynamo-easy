import { hasSortKey, Metadata } from '../decorator/metadata'
import { attribute } from './expression/logical-operator'
import { ConditionExpressionDefinitionFunction } from './expression/type'


export function createIfNotExistsCondition<T>(metadata: Metadata<T>): ConditionExpressionDefinitionFunction[] {
  const conditionDefFns: ConditionExpressionDefinitionFunction[] = [
    attribute<T>(metadata.getPartitionKey()).attributeNotExists(),
  ]
  if (hasSortKey(metadata)) {
    conditionDefFns.push(attribute<T>(metadata.getSortKey()).attributeNotExists())
  }
  return conditionDefFns
}
