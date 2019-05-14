import { attribute } from './attribute.function'
import { mergeConditions } from './merge-conditions.function'

describe('mergeCondition statements', () => {
  test('no redundant parentheses for single condition', () => {
    const conditionDefinitionFns = [attribute('name').beginsWith('sample')]

    const conditions = mergeConditions('OR', conditionDefinitionFns)
    const expression = conditions(undefined, undefined)
    expect(expression.statement).toEqual('begins_with (#name, :name)')
  })

  test('no redundant parentheses for multiple condition', () => {
    const conditionDefinitionFns = [attribute('name').beginsWith('sample'), attribute('fullName').beginsWith('sample')]

    const conditions = mergeConditions('OR', conditionDefinitionFns)
    const expression = conditions(undefined, undefined)

    expect(expression.statement).toEqual('(begins_with (#name, :name) OR begins_with (#fullName, :fullName))')
  })

  test('no redundant parentheses for single condition combined', () => {
    const conditionDefinitionFns = [attribute('name').beginsWith('sample'), attribute('fullName').beginsWith('sample')]

    const conditions = mergeConditions('OR', conditionDefinitionFns)
    const andConditions = mergeConditions('AND', [conditions])
    const expression = andConditions(undefined, undefined)
    expect(expression.statement).toEqual('(begins_with (#name, :name) OR begins_with (#fullName, :fullName))')
  })
})
