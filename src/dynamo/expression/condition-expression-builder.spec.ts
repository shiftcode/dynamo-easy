// tslint:disable:max-classes-per-file
import { ComplexModel } from '../../../test/models'
import { Form, FormId, formIdMapper, FormType } from '../../../test/models/real-world'
import { CollectionProperty } from '../../decorator/impl/collection/collection-property.decorator'
import { PartitionKey } from '../../decorator/impl/key/partition-key.decorator'
import { Model } from '../../decorator/impl/model/model.decorator'
import { Property } from '../../decorator/impl/property/property.decorator'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { typeOf } from '../../mapper/util'
import {
  buildFilterExpression,
  deepFilter,
  ERR_ARITY_DEFAULT,
  ERR_ARITY_IN,
  ERR_VALUES_BETWEEN_TYPE,
  ERR_VALUES_IN,
} from './condition-expression-builder'
import { operatorParameterArity } from './functions/operator-parameter-arity.function'
import { ConditionOperator } from './type/condition-operator.type'
import { dynamicTemplate } from './util'

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
      { blub: undefined, other: undefined, empty_arr: [] },
      new Set(arr),
    ]

    const filteredObj = deepFilter(obj, (item) => item !== undefined)
    expect(filteredObj).toEqual([
      { street: 'street', zip: 1524 },
      [{ age: 25 }],
      [{}],
      {},
      [],
      { empty_arr: [] },
      new Set([arr[0], arr[1]]),
    ])
  })

  it('use property metadata', () => {
    const condition = buildFilterExpression('prop', '>', [10], undefined, metadataForModel(MyModel))
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
      const condition = buildFilterExpression('age', '>', [10], undefined, metadataForModel(MyModel))
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

    describe('contains', () => {
      it('string subsequence', () => {
        const condition = buildFilterExpression('id', 'contains', ['substr'], undefined, metadataForModel(Form))
        expect(condition.statement).toBe('contains (#id, :id)')
        expect(condition.attributeNames).toEqual({ '#id': 'id' })
        expect(condition.attributeValues).toEqual({ ':id': { S: 'substr' } })
      })

      it('value in set', () => {
        const condition = buildFilterExpression('types', 'contains', [2], undefined, metadataForModel(Form))
        expect(condition.statement).toBe('contains (#types, :types)')
        expect(condition.attributeNames).toEqual({ '#types': 'types' })
        expect(condition.attributeValues).toEqual({ ':types': { N: '2' } })
      })

      it('value in set with custom mapper', () => {
        @Model()
        class MyModelWithCustomMappedSet {
          @CollectionProperty({ itemMapper: formIdMapper })
          formIds: Set<FormId>
        }

        const condition = buildFilterExpression(
          'formIds',
          'contains',
          [new FormId(FormType.REQUEST, 1, 2019)],
          undefined,
          metadataForModel(MyModelWithCustomMappedSet),
        )
        expect(condition.statement).toBe('contains (#formIds, :formIds)')
        expect(condition.attributeNames).toEqual({ '#formIds': 'formIds' })
        expect(condition.attributeValues).toEqual({ ':formIds': { S: 'AF00012019' } })
      })
    })

    describe('not_contains', () => {
      it('string subsequence', () => {
        const condition = buildFilterExpression('id', 'not_contains', ['substr'], undefined, metadataForModel(Form))
        expect(condition.statement).toBe('not_contains (#id, :id)')
        expect(condition.attributeNames).toEqual({ '#id': 'id' })
        expect(condition.attributeValues).toEqual({ ':id': { S: 'substr' } })
      })

      it('value in set', () => {
        const condition = buildFilterExpression('types', 'not_contains', [2], undefined, metadataForModel(Form))
        expect(condition.statement).toBe('not_contains (#types, :types)')
        expect(condition.attributeNames).toEqual({ '#types': 'types' })
        expect(condition.attributeValues).toEqual({ ':types': { N: '2' } })
      })

      it('value in set with custom mapper', () => {
        @Model()
        class MyModelWithCustomMappedSet {
          @CollectionProperty({ itemMapper: formIdMapper })
          formIds: Set<FormId>
        }

        const condition = buildFilterExpression(
          'formIds',
          'not_contains',
          [new FormId(FormType.REQUEST, 1, 2019)],
          undefined,
          metadataForModel(MyModelWithCustomMappedSet),
        )
        expect(condition.statement).toBe('not_contains (#formIds, :formIds)')
        expect(condition.attributeNames).toEqual({ '#formIds': 'formIds' })
        expect(condition.attributeValues).toEqual({ ':formIds': { S: 'AF00012019' } })
      })
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
      expect(':counter' in condition.attributeValues).toBeTruthy()
      expect(condition.attributeValues[':counter']).toEqual({ N: '2' })
      expect(':counter_2' in condition.attributeValues).toBeTruthy()
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
        metadataForModel(ComplexModel),
      )

      expect(condition.statement).toBe('#creationDate BETWEEN :creationDate AND :creationDate_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#creationDate')
      expect(condition.attributeNames['#creationDate']).toBe('creationDate')

      expect(condition.attributeValues).toBeDefined()
      expect(Object.keys(condition.attributeValues).length).toBe(2)
      expect(':creationDate' in condition.attributeValues).toBeTruthy()
      expect(condition.attributeValues[':creationDate']).toEqual({ S: date1.toISOString() })
      expect(':creationDate_2' in condition.attributeValues).toBeTruthy()
      expect(condition.attributeValues[':creationDate_2']).toEqual({ S: date2.toISOString() })
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

  describe('validation', () => {
    describe('arity', () => {
      it('should throw default error for wrong arity', () => {
        const operator: ConditionOperator = 'attribute_type'
        expect(() => buildFilterExpression('age', operator, [], undefined, undefined)).toThrow(
          dynamicTemplate(ERR_ARITY_DEFAULT, { parameterArity: operatorParameterArity(operator), operator }),
        )
      })

      it('should throw error for wrong IN arity', () => {
        const operator: ConditionOperator = 'IN'
        expect(() =>
          buildFilterExpression('age', operator, ['myValue', 'mySecondValue'], undefined, undefined),
        ).toThrowError(dynamicTemplate(ERR_ARITY_IN, { parameterArity: operatorParameterArity(operator), operator }))
      })
    })

    describe('operator values', () => {
      it('should throw error for wrong IN values', () => {
        const operator: ConditionOperator = 'IN'
        expect(() => buildFilterExpression('age', operator, ['myValue'], undefined, undefined)).toThrowError(
          ERR_VALUES_IN,
        )
      })

      it('should throw error for wrong value type', () => {
        const operator: ConditionOperator = 'BETWEEN'
        expect(() => buildFilterExpression('age', operator, ['myValue', 2], undefined, undefined)).toThrowError(
          dynamicTemplate(ERR_VALUES_BETWEEN_TYPE, { value1: typeOf('myValue'), value2: typeOf(2) }),
        )
      })
    })
  })
})
