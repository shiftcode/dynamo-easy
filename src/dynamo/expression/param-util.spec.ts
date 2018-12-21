import { Model, PartitionKey } from '../../decorator/impl'
import { Metadata, metadataForClass } from '../../decorator/metadata'
import { ConditionalParams } from '../operation-params.type'
import { and, or, update2 } from './logical-operator'
import { attribute } from './logical-operator/attribute.function'
import { addExpression, mergeUpdateExpressions } from './param-util'

describe('ParamUtils', () => {
  @Model()
  class FooBar {
    @PartitionKey()
    a: number
    b: number
    c: number
  }

  let params: ConditionalParams
  let metadata: Metadata<FooBar>
  beforeEach(() => {
    params = {}
    metadata = metadataForClass(FooBar)
  })

  it('shoud build correct conditions', () => {
    const conditionDefFns = [and(attribute('a').eq(1), or(attribute('b').eq(2), attribute('c').between(3, 5)))]
    const condition = and(...conditionDefFns)(undefined, metadata)
    addExpression('ConditionExpression', condition, params)

    expect(params.ExpressionAttributeNames).toEqual({
      '#a': 'a',
      '#b': 'b',
      '#c': 'c',
    })
    expect(params.ExpressionAttributeValues).toEqual({
      ':a': { N: '1' },
      ':b': { N: '2' },
      ':c': { N: '3' },
      ':c_2': { N: '5' },
    })
    expect(params.ConditionExpression).toBe('((#a = :a AND (#b = :b OR #c BETWEEN :c AND :c_2)))')
  })

  it('should build correct UpdateExpression', () => {
    const updt = update2(FooBar, 'b').set(3)(undefined, metadata)
    addExpression('UpdateExpression', updt, params)

    expect(params).toEqual({
      UpdateExpression: '#b = :b',
      ExpressionAttributeNames: { '#b': 'b' },
      ExpressionAttributeValues: { ':b': { N: '3' } },
    })

    const cndtn = attribute('b').eq(2)(undefined, metadata)
    addExpression('ConditionExpression', cndtn, params)

    expect(params).toEqual({
      UpdateExpression: '#b = :b',
      ConditionExpression: '#b = :b_2',
      ExpressionAttributeNames: { '#b': 'b' },
      ExpressionAttributeValues: {
        ':b': { N: '3' },
        ':b_2': { N: '2' },
      },
    })
  })

  describe('mergeUpdateExpressions', () => {
    it('should correctly merge', () => {
      expect(
        mergeUpdateExpressions(
          'SET a, b REMOVE e, f ADD i, j DELETE m, n',
          'SET c, d REMOVE g, h ADD k, l DELETE o, p',
        ),
      ).toBe('SET a, b, c, d REMOVE e, f, g, h ADD i, j, k, l DELETE m, n, o, p')

      expect(mergeUpdateExpressions('DELETE a', 'SET b REMOVE c')).toBe('DELETE a SET b REMOVE c')

      expect(mergeUpdateExpressions('ADD a SET b', 'REMOVE c, d')).toBe('ADD a SET b REMOVE c, d')

      expect(mergeUpdateExpressions('SET #doRemove = :doRemove, #doAdd = :doAdd', 'REMOVE c, d')).toBe(
        'SET #doRemove = :doRemove, #doAdd = :doAdd REMOVE c, d',
      )
    })
  })
})
