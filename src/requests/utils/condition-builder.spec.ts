import { DynamoDBCustomizations } from 'aws-sdk/lib/services/dynamodb'
import { has } from 'lodash'
import { Organization } from '../../../test/models/organization.model'
import { DynamoRx } from '../../dynamo/dynamo-rx'
import { QueryRequest } from '../query/query-request'
import { DYNAMO_RX_MOCK } from '../query/query-request.spec'
import { ConditionBuilder } from './condition-builder'
import { ConditionOperator } from './condition-operator.type'

describe('condition builder', () => {
  describe('simple conditions', () => {
    it('equals', () => {
      const condition = ConditionBuilder.build('id').equals('equalsValue')
      expect(condition.statement).toBe('#id = :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':id')
      expect(condition.attributeMap[':id']).toEqual({ S: 'equalsValue' })
    })

    it('not equals', () => {
      const condition = ConditionBuilder.build('id').ne('notEqualsValue')
      expect(condition.statement).toBe('#id <> :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':id')
      expect(condition.attributeMap[':id']).toEqual({ S: 'notEqualsValue' })
    })

    it('greater than', () => {
      const condition = ConditionBuilder.build('count').gt(5)
      expect(condition.statement).toBe('#count > :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '5' })
    })

    it('greater than, equal', () => {
      const condition = ConditionBuilder.build('count').gte(10)
      expect(condition.statement).toBe('#count >= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '10' })
    })

    it('lower than', () => {
      const condition = ConditionBuilder.build('count').lt(100)
      expect(condition.statement).toBe('#count < :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '100' })
    })

    it('lower than, equal', () => {
      const condition = ConditionBuilder.build('count').lte(100)
      expect(condition.statement).toBe('#count <= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '100' })
    })

    it('attribute exists', () => {
      const condition = ConditionBuilder.build('attr').notNull()
      expect(condition.statement).toBe('attribute_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(0)
    })

    it('attribute not exists', () => {
      const condition = ConditionBuilder.build('attr').null()
      expect(condition.statement).toBe('attribute_not_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(0)
    })

    it('attribute type', () => {
      const condition = ConditionBuilder.build('attr').type('S')
      expect(condition.statement).toBe('attribute_type (#attr, :attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':attr')
      expect(condition.attributeMap[':attr']).toEqual({ S: 'S' })
    })

    it('begins with', () => {
      const condition = ConditionBuilder.build('textProp').beginsWith('te')
      expect(condition.statement).toBe('begins_with (#textProp, :textProp)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#textProp')
      expect(condition.attributeNames['#textProp']).toBe('textProp')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':textProp')
      expect(condition.attributeMap[':textProp']).toEqual({ S: 'te' })
    })

    it('contains', () => {
      const condition = ConditionBuilder.build('myCollection').contains(2)
      expect(condition.statement).toBe('contains (#myCollection, :myCollection)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#myCollection')
      expect(condition.attributeNames['#myCollection']).toBe('myCollection')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':myCollection')
      expect(condition.attributeMap[':myCollection']).toEqual({ S: '2' })
    })

    it('size', () => {
      const condition = ConditionBuilder.build('mySet').size()
      expect(condition.statement).toBe('size (#mySet)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#mySet')
      expect(condition.attributeNames['#mySet']).toBe('mySet')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(0)
    })

    it('in', () => {
      const condition = ConditionBuilder.build('myCollection').in(['myCollection', 'myOtherValue'])
      expect(condition.statement).toBe('#myCollection IN (:myCollection,:myCollection_2)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#myCollection')
      expect(condition.attributeNames['#myCollection']).toBe('myCollection')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':myCollection')
      expect(condition.attributeMap[':myCollection']).toEqual('myCollection')
      expect(Object.keys(condition.attributeMap)[1]).toBe(':myCollection_2')
      expect(condition.attributeMap[':myCollection_2']).toEqual('myOtherValue')
    })

    it('between (numbers)', () => {
      const condition = ConditionBuilder.build('counter').between(2, 5)
      expect(condition.statement).toBe('#counter BETWEEN :counter AND :counter_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#counter')
      expect(condition.attributeNames['#counter']).toBe('counter')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(2)
      expect(has(condition.attributeMap, ':counter')).toBeTruthy()
      expect(condition.attributeMap[':counter']).toEqual(2)
      expect(has(condition.attributeMap, ':counter_2')).toBeTruthy()
      expect(condition.attributeMap[':counter_2']).toEqual(5)
    })
  })

  describe('key condition', () => {
    const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization)
    ConditionBuilder.addKeyCondition('id', queryRequest).equals('idValue')

    const params = queryRequest.params
    expect(params.KeyConditionExpression).toBe('(#id = :id)')
    expect(params.ExpressionAttributeNames).toEqual({ '#id': 'id' })
    expect(params.ExpressionAttributeValues).toEqual({ ':id': { S: 'idValue' } })
  })

  describe('complex conditions', () => {
    // CondChain.and(
    //   ConditionBuilder.build('id').beginsWith('bla')
    // )
    //
    // QB.not(
    //   QB.where('id').equals('idValue'),
    //   QB.where('bla').contains('ha')
    // )
  })
})
