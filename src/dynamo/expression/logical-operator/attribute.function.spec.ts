import { SimpleWithPartitionKeyModel } from '../../../../test/models'
import { Expression } from '../type/expression.type'
import { and } from './and.function'
import { attribute, attribute2 } from './attribute.function'
import { not } from './not.function'
import { or } from './or.function'

describe('chained conditions', () => {
  let condition: Expression

  describe('conditions', () => {
    it('equals', () => {
      condition = attribute('name').equals('foo')(undefined, undefined)
      expect(condition.statement).toBe('#name = :name')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('eq', () => {
      condition = attribute('name').eq('foo')(undefined, undefined)
      expect(condition.statement).toBe('#name = :name')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('ne', () => {
      condition = attribute('name').ne('foo')(undefined, undefined)
      expect(condition.statement).toBe('#name <> :name')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('lte', () => {
      condition = attribute('age').lte(5)(undefined, undefined)
      expect(condition.statement).toBe('#age <= :age')
      expect(condition.attributeValues).toEqual({ ':age': { N: '5' } })
    })
    it('lt', () => {
      condition = attribute('age').lt(5)(undefined, undefined)
      expect(condition.statement).toBe('#age < :age')
      expect(condition.attributeValues).toEqual({ ':age': { N: '5' } })
    })
    it('gte', () => {
      condition = attribute('age').gte(5)(undefined, undefined)
      expect(condition.statement).toBe('#age >= :age')
      expect(condition.attributeValues).toEqual({ ':age': { N: '5' } })
    })
    it('gt', () => {
      condition = attribute('age').gt(5)(undefined, undefined)
      expect(condition.statement).toBe('#age > :age')
      expect(condition.attributeValues).toEqual({ ':age': { N: '5' } })
    })
    it('attributeNotExists', () => {
      condition = attribute('name').attributeNotExists()(undefined, undefined)
      expect(condition.statement).toBe('attribute_not_exists (#name)')
    })
    it('null', () => {
      condition = attribute('name').null()(undefined, undefined)
      expect(condition.statement).toBe('attribute_not_exists (#name)')
    })
    it('attributeExists', () => {
      condition = attribute('name').attributeExists()(undefined, undefined)
      expect(condition.statement).toBe('attribute_exists (#name)')
    })
    it('notNull', () => {
      condition = attribute('name').notNull()(undefined, undefined)
      expect(condition.statement).toBe('attribute_exists (#name)')
    })
    it('contains', () => {
      condition = attribute('name').contains('foo')(undefined, undefined)
      expect(condition.statement).toBe('contains (#name, :name)')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('not_contains', () => {
      condition = attribute('name').notContains('foo')(undefined, undefined)
      expect(condition.statement).toBe('not_contains (#name, :name)')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('type', () => {
      condition = attribute('age').type('N')(undefined, undefined)
      expect(condition.statement).toBe('attribute_type (#age, :age)')
      expect(condition.attributeValues).toEqual({ ':age': { S: 'N' } })
    })
    it('in', () => {
      condition = attribute('name').in(['aName'])(undefined, undefined)
      expect(condition.statement).toBe('#name IN (:name_0)')
      expect(condition.attributeValues).toEqual({ ':name_0': { S: 'aName' } })
    })
    it('beginsWith', () => {
      condition = attribute('name').beginsWith('foo')(undefined, undefined)
      expect(condition.statement).toBe('begins_with (#name, :name)')
      expect(condition.attributeValues).toEqual({ ':name': { S: 'foo' } })
    })
    it('between', () => {
      condition = attribute('age').between(18, 26)(undefined, undefined)
      expect(condition.statement).toBe('#age BETWEEN :age AND :age_2')
      expect(condition.attributeValues).toEqual({
        ':age': { N: '18' },
        ':age_2': { N: '26' },
      })
    })
  })

  describe('combinations', () => {
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
      condition = or(attribute('age').gt(10), attribute('name').contains('SortedUpdateExpressions'))(
        undefined,
        undefined,
      )

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

  it('strictly typed', () => {
    condition = attribute2(SimpleWithPartitionKeyModel, 'age').attributeExists()(undefined, undefined)
    expect(condition.statement).toBe('attribute_exists (#age)')
  })
})
