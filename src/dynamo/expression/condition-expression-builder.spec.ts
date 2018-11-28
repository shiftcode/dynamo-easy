import { has } from 'lodash'
import { ComplexModel } from '../../../test/models'
import { Model, PartitionKey, Property } from '../../decorator/impl'
import { metadataForClass } from '../../decorator/metadata'
import { buildFilterExpression, deepFilter } from './condition-expression-builder'

@Model()
class MyModel {
  @Property({ name: 'myId' })
  @PartitionKey()
  id: string

  @Property({ name: 'propDb' })
  prop: number

  list: any[]
}

describe('expressions', () => {
  it('deep filter', () => {
    const arr = [5, 'bla', undefined]
    const obj = [
      { street: 'street', zip: 1524 },
      undefined,
      [undefined, { name: undefined, age: 25 }],
      [undefined, undefined, {}],
      {},
      [],
      { blub: undefined, other: undefined },
      new Set(arr),
    ]

    const filteredObj = deepFilter(obj, item => item !== undefined)
    expect(filteredObj).toEqual([{ street: 'street', zip: 1524 }, [{ age: 25 }], new Set([arr[0], arr[1]])])
  })

  it('use property metadata', () => {
    const condition = buildFilterExpression('prop', '>', [10], undefined, metadataForClass(MyModel))
    expect(condition.statement).toBe('#prop > :prop')

    expect(condition.attributeNames['#prop']).toBe('propDb')
    expect(condition.attributeValues[':prop']).toEqual({ N: '10' })
  })

  it('existing attributeValues', () => {
    const condition = buildFilterExpression('prop', '>', [10], [':prop'], undefined)
    expect(condition.statement).toBe('#prop > :prop_2')

    expect(condition.attributeNames['#prop']).toBe('prop')
    expect(condition.attributeValues[':prop_2']).toEqual({ N: '10' })
  })

  describe('operators', () => {
    it('simple', () => {
      // property('age').gt(10)
      const condition = buildFilterExpression('age', '>', [10], undefined, metadataForClass(MyModel))
      expect(condition.statement).toBe('#age > :age')
    })

    it('equals', () => {
      // property('id').equals('equalsValue'))
      const condition = buildFilterExpression('id', '=', ['equalsValue'], undefined, undefined)
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
      const condition = buildFilterExpression('id', '<>', ['notEqualsValue'], undefined, undefined)
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
      const condition = buildFilterExpression('count', '>', [5], undefined, undefined)
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
      const condition = buildFilterExpression('count', '>=', [10], undefined, undefined)
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
      const condition = buildFilterExpression('count', '<', [100], undefined, undefined)
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
      const condition = buildFilterExpression('count', '<=', [100], undefined, undefined)
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
      const condition = buildFilterExpression('attr', 'attribute_exists', [], undefined, undefined)
      expect(condition.statement).toBe('attribute_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(0)
    })

    it('attribute not exists', () => {
      // property('attr').null()
      const condition = buildFilterExpression('attr', 'attribute_not_exists', [], undefined, undefined)
      expect(condition.statement).toBe('attribute_not_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(0)
    })

    it('attribute type', () => {
      // property('attr').type('S')
      const condition = buildFilterExpression('attr', 'attribute_type', ['S'], undefined, undefined)
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
      const condition = buildFilterExpression('textProp', 'begins_with', ['te'], undefined, undefined)
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
      const condition = buildFilterExpression('myCollection', 'contains', [2], undefined, undefined)
      expect(condition.statement).toBe('contains (#myCollection, :myCollection)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#myCollection')
      expect(condition.attributeNames['#myCollection']).toBe('myCollection')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues)[0]).toBe(':myCollection')
      expect(condition.attributeValues[':myCollection']).toEqual({ N: '2' })
    })

    it('in', () => {
      // property('myCollection').in(['myCollection', 'myOtherValue'])
      const condition = buildFilterExpression('myCollection', 'IN', [['myValue', 'myOtherValue']], undefined, undefined)
      expect(condition.statement).toBe('#myCollection IN (:myCollection_0, :myCollection_1)')
      expect(condition.attributeNames).toEqual({ '#myCollection': 'myCollection' })
      expect(condition.attributeValues).toEqual({
        ':myCollection_0': { S: 'myValue' },
        ':myCollection_1': { S: 'myOtherValue' },
      })
    })

    it('between (numbers)', () => {
      // property('counter').between(2, 5)
      const condition = buildFilterExpression('counter', 'BETWEEN', [2, 5], undefined, undefined)
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

    it('between (custom mapper)', () => {
      const date1 = new Date('2017-03-17T20:00:00.000Z')
      const date2 = new Date('2017-05-07T20:00:00.000Z')
      // property('creationDate').between(date1, date2)
      const condition = buildFilterExpression(
        'creationDate',
        'BETWEEN',
        [date1, date2],
        undefined,
        metadataForClass(ComplexModel),
      )

      expect(condition.statement).toBe('#creationDate BETWEEN :creationDate AND :creationDate_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#creationDate')
      expect(condition.attributeNames['#creationDate']).toBe('creationDate')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(2)
      expect(has(condition.attributeValues, ':creationDate')).toBeTruthy()
      expect(condition.attributeValues[':creationDate']).toEqual({ S: date1.toISOString() })
      expect(has(condition.attributeValues, ':creationDate_2')).toBeTruthy()
      expect(condition.attributeValues[':creationDate_2']).toEqual({ S: date2.toISOString() })
    })

    it('should throw error for wrong value arity', () => {
      expect(() => buildFilterExpression('age', 'attribute_type', [], undefined, undefined)).toThrowError(
        'expected 1 value(s) for operator attribute_type, this is not the right amount of method parameters for this operator',
      )
    })

    it('should throw error for wrong value arity', () => {
      expect(() => buildFilterExpression('age', 'attribute_type', [undefined], undefined, undefined)).toThrowError(
        'expected 1 value(s) for operator attribute_type, this is not the right amount of method parameters for this operator',
      )
    })

    it('should throw error for wrong value type', () => {
      expect(() => buildFilterExpression('age', 'IN', ['myValue', 'mySecondValue'], undefined, undefined)).toThrowError(
        'expected 1 value(s) for operator IN, this is not the right amount of method parameters for this operator (IN operator requires one value of array type)',
      )
    })
  })

  describe('operator nested attributes', () => {
    it('list path', () => {
      // property('age').gt(10)
      const condition = buildFilterExpression('list[0]', '>', [10], undefined, undefined)

      expect(condition.statement).toBe('#list[0] > :list_at_0')
      expect(condition.attributeNames).toEqual({ '#list': 'list' })
      expect(condition.attributeValues).toEqual({ ':list_at_0': { N: '10' } })
    })

    it('document (map) path', () => {
      // property('age').gt(10)
      const condition = buildFilterExpression('person.age', '>', [10], undefined, undefined)

      expect(condition.statement).toBe('#person.#age > :person__age')
      expect(condition.attributeNames).toEqual({ '#person': 'person', '#age': 'age' })
      expect(condition.attributeValues).toEqual({ ':person__age': { N: '10' } })
    })

    it('combined path', () => {
      // property('age').gt(10)
      const condition = buildFilterExpression('person.birthdays[5].year', '=', [2016], undefined, undefined)

      expect(condition.statement).toBe('#person.#birthdays[5].#year = :person__birthdays_at_5__year')
      expect(condition.attributeNames).toEqual({ '#person': 'person', '#birthdays': 'birthdays', '#year': 'year' })
      expect(condition.attributeValues).toEqual({ ':person__birthdays_at_5__year': { N: '2016' } })
    })
  })
})
