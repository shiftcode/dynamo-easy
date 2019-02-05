import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { Expression } from '../type/expression.type'
import { and } from './and.function'
import { attribute, attribute2 } from './attribute.function'
import { not } from './not.function'
import { or } from './or.function'

describe('chained conditions', () => {
  let condition: Expression

  it('strictly typed', () => {
    condition = attribute2(SimpleWithPartitionKeyModel, 'age').attributeExists()(undefined, undefined)
    expect(condition.statement).toBe('attribute_exists (#age)')
  })

  it('not', () => {
    condition = not(attribute('name').contains('SortedUpdateExpressions'))(undefined, undefined)
    expect(condition.statement).toBe('NOT contains (#name, :name)')
  })

  it('and & not', () => {
    condition = and(not(attribute('name').contains('z')), attribute('name').beginsWith('Sta'))(undefined, undefined)

    expect(condition.attributeNames).toBeDefined()
    expect(Object.keys(condition.attributeNames).length).toBe(1)

    expect(condition.attributeValues).toBeDefined()
    expect(Object.keys(condition.attributeValues).length).toBe(2)
    expect(condition.attributeValues[':name']).toEqual({ S: 'z' })
    expect(condition.attributeValues[':name_2']).toEqual({ S: 'Sta' })

    expect(condition.statement).toBe('(NOT contains (#name, :name) AND begins_with (#name, :name_2))')
  })

  it('or', () => {
    condition = or(attribute('age').gt(10), attribute('name').contains('SortedUpdateExpressions'))(undefined, undefined)

    expect(condition.statement).toBe('(#age > :age OR contains (#name, :name))')
  })

  it('and', () => {
    condition = and(attribute('age').gt(10), attribute('name').contains('SortedUpdateExpressions'))(
      undefined,
      undefined,
    )

    expect(condition.statement).toBe('(#age > :age AND contains (#name, :name))')
  })

  it('mixed', () => {
    condition = or(
      and(attribute('age').gt(10), attribute('name').contains('SortedUpdateExpressions')),
      attribute('doAddCondition').beginsWith('Start'),
    )(undefined, undefined)

    expect(condition.statement).toBe(
      '((#age > :age AND contains (#name, :name)) OR begins_with (#doAddCondition, :doAddCondition))',
    )
  })
})
