import { and } from './and.function'
import { attribute } from './attribute.function'
import { not } from './not.function'
import { or } from './or.function'

describe('chained conditions', () => {
  it('not', () => {
    const condition = not(attribute('name').contains('Bla'))(undefined, undefined)
    expect(condition.statement).toBe('NOT contains (#name, :name)')
  })

  it('and & not', () => {
    const condition = and(not(attribute('name').contains('z')), attribute('name').beginsWith('Sta'))(
      undefined,
      undefined
    )

    expect(condition.attributeNames).toBeDefined()
    expect(Object.keys(condition.attributeNames).length).toBe(1)

    expect(condition.attributeValues).toBeDefined()
    expect(Object.keys(condition.attributeValues).length).toBe(2)
    expect(condition.attributeValues[':name']).toEqual({ S: 'z' })
    expect(condition.attributeValues[':name_2']).toEqual({ S: 'Sta' })

    expect(condition.statement).toBe('(NOT contains (#name, :name) AND begins_with (#name, :name_2))')
  })

  it('or', () => {
    const condition = or(attribute('age').gt(10), attribute('name').contains('Bla'))(undefined, undefined)

    expect(condition.statement).toBe('(#age > :age OR contains (#name, :name))')
  })

  it('and', () => {
    const condition = and(attribute('age').gt(10), attribute('name').contains('Bla'))(undefined, undefined)

    expect(condition.statement).toBe('(#age > :age AND contains (#name, :name))')
  })

  it('mixed', () => {
    const condition = or(
      and(attribute('age').gt(10), attribute('name').contains('Bla')),
      attribute('doAddCondition').beginsWith('Start')
    )(undefined, undefined)

    expect(condition.statement).toBe(
      '((#age > :age AND contains (#name, :name)) OR begins_with (#doAddCondition, :doAddCondition))'
    )
  })
})
