import { has } from 'lodash'
import moment from 'moment-es6'
import { PartitionKey } from '../../decorator/impl/key/partition-key.decorator'
import { Model } from '../../decorator/impl/model/model.decorator'
import { Property } from '../../decorator/impl/property/property.decorator'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { ConditionExpressionBuilder } from './condition-expression-builder'

@Model()
class MyModel {
  // FIXME TEST if the db name is used for requests
  @Property({ name: 'myId' })
  @PartitionKey()
  id: string

  @Property({ name: 'propDb' })
  prop: number
}

describe('expressions', () => {
  it('use property metadata', () => {
    const condition = ConditionExpressionBuilder.buildFilterExpression(
      'prop',
      '>',
      [10],
      undefined,
      MetadataHelper.get(MyModel)
    )
    expect(condition.statement).toBe('#prop > :prop')

    expect(condition.attributeNames['#prop']).toBe('propDb')
    expect(condition.attributeValues[':prop']).toEqual({ N: '10' })
  })

  it('existing attributeValues', () => {
    const condition = ConditionExpressionBuilder.buildFilterExpression('prop', '>', [10], [':prop'], undefined)
    expect(condition.statement).toBe('#prop > :prop_2')

    expect(condition.attributeNames['#prop']).toBe('prop')
    expect(condition.attributeValues[':prop_2']).toEqual({ N: '10' })
  })

  describe('operators', () => {
    it('simple', () => {
      // property('age').gt(10)
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'age',
        '>',
        [10],
        undefined,
        MetadataHelper.get(MyModel)
      )
      expect(condition.statement).toBe('#age > :age')
    })

    it('equals', () => {
      // property('id').equals('equalsValue'))
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'id',
        '=',
        ['equalsValue'],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('#id = :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':id')
      expect(condition.attributeValues[':id']).toEqual({ S: 'equalsValue' })
    })

    it('not equals', () => {
      // property('id').ne('notEqualsValue')
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'id',
        '<>',
        ['notEqualsValue'],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('#id <> :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':id')
      expect(condition.attributeValues[':id']).toEqual({ S: 'notEqualsValue' })
    })

    it('greater than', () => {
      // property('count').gt(5)
      const condition = ConditionExpressionBuilder.buildFilterExpression('count', '>', [5], undefined, undefined)
      expect(condition.statement).toBe('#count > :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':count')
      expect(condition.attributeValues[':count']).toEqual({ N: '5' })
    })

    it('greater than, equal', () => {
      // property('count').gte(10)
      const condition = ConditionExpressionBuilder.buildFilterExpression('count', '>=', [10], undefined, undefined)
      expect(condition.statement).toBe('#count >= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':count')
      expect(condition.attributeValues[':count']).toEqual({ N: '10' })
    })

    it('lower than', () => {
      // property('count').lt(100)
      const condition = ConditionExpressionBuilder.buildFilterExpression('count', '<', [100], undefined, undefined)
      expect(condition.statement).toBe('#count < :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':count')
      expect(condition.attributeValues[':count']).toEqual({ N: '100' })
    })

    it('lower than, equal', () => {
      // property('count').lte(100)
      const condition = ConditionExpressionBuilder.buildFilterExpression('count', '<=', [100], undefined, undefined)
      expect(condition.statement).toBe('#count <= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':count')
      expect(condition.attributeValues[':count']).toEqual({ N: '100' })
    })

    it('attribute exists', () => {
      // property('attr').notNull()
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'attr',
        'attribute_exists',
        [],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('attribute_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(0)
    })

    it('attribute not exists', () => {
      // property('attr').null()
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'attr',
        'attribute_not_exists',
        [],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('attribute_not_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(0)
    })

    it('attribute type', () => {
      // property('attr').type('S')
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'attr',
        'attribute_type',
        ['S'],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('attribute_type (#attr, :attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':attr')
      expect(condition.attributeValues[':attr']).toEqual({ S: 'S' })
    })

    it('begins with', () => {
      // property('textProp').beginsWith('te')
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'textProp',
        'begins_with',
        ['te'],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('begins_with (#textProp, :textProp)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#textProp')
      expect(condition.attributeNames['#textProp']).toBe('textProp')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':textProp')
      expect(condition.attributeValues[':textProp']).toEqual({ S: 'te' })
    })

    it('contains', () => {
      // property('myCollection').contains(2)
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'myCollection',
        'contains',
        [2],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('contains (#myCollection, :myCollection)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#myCollection')
      expect(condition.attributeNames['#myCollection']).toBe('myCollection')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':myCollection')
      expect(condition.attributeValues[':myCollection']).toEqual({ S: '2' })
    })

    it('in', () => {
      // property('myCollection').in(['myCollection', 'myOtherValue'])
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'myCollection',
        'IN',
        [['myCollection', 'myOtherValue']],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('#myCollection IN (:myCollection)')
      expect(condition.attributeNames).toEqual({ '#myCollection': 'myCollection' })
      expect(condition.attributeValues).toEqual({ ':myCollection': { L: ['myCollection', 'myOtherValue'] } })
    })

    it('between (numbers)', () => {
      // property('counter').between(2, 5)
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'counter',
        'BETWEEN',
        [2, 5],
        undefined,
        undefined
      )
      expect(condition.statement).toBe('#counter BETWEEN :counter AND :counter_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#counter')
      expect(condition.attributeNames['#counter']).toBe('counter')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(2)
      expect(has(condition.attributeValues, ':counter')).toBeTruthy()
      expect(condition.attributeValues[':counter']).toEqual({ N: '2' })
      expect(has(condition.attributeValues, ':counter_2')).toBeTruthy()
      expect(condition.attributeValues[':counter_2']).toEqual({ N: '5' })
    })

    it('between (moment dates)', () => {
      const date1 = moment('2017-03-17T20:00:00.000Z')
      const date2 = moment('2017-05-07T20:00:00.000Z')
      // property('creationDate').between(date1, date2)
      const condition = ConditionExpressionBuilder.buildFilterExpression(
        'creationDate',
        'BETWEEN',
        [date1, date2],
        undefined,
        undefined
      )

      expect(condition.statement).toBe('#creationDate BETWEEN :creationDate AND :creationDate_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#creationDate')
      expect(condition.attributeNames['#creationDate']).toBe('creationDate')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(2)
      expect(has(condition.attributeValues, ':creationDate')).toBeTruthy()
      expect(condition.attributeValues[':creationDate']).toEqual({
        S: date1
          .clone()
          .utc()
          .format(),
      })
      expect(has(condition.attributeValues, ':creationDate_2')).toBeTruthy()
      expect(condition.attributeValues[':creationDate_2']).toEqual({
        S: date2
          .clone()
          .utc()
          .format(),
      })
    })

    it('should throw error for wrong value arity', () => {
      expect(() => {
        const condition = ConditionExpressionBuilder.buildFilterExpression(
          'age',
          'attribute_type',
          [],
          undefined,
          undefined
        )
      }).toThrowError(
        'expected 1 value(s) for operator attribute_type, this is not the right amount of method parameters for this operator'
      )
    })

    it('should throw error for wrong value arity', () => {
      expect(() => {
        const condition = ConditionExpressionBuilder.buildFilterExpression(
          'age',
          'attribute_type',
          [undefined],
          undefined,
          undefined
        )
      }).toThrowError(
        'expected 1 value(s) for operator attribute_type, this is not the right amount of method parameters for this operator'
      )
    })

    it('should throw error for wrong value type', () => {
      expect(() => {
        const condition = ConditionExpressionBuilder.buildFilterExpression(
          'age',
          'IN',
          ['myValue', 'mySecondValue'],
          undefined,
          undefined
        )
      }).toThrowError(
        'expected 1 value(s) for operator IN, this is not the right amount of method parameters for this operator (IN operator requires one value of array type)'
      )
    })
  })
})
