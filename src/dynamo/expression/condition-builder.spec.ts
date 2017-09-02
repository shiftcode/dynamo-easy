import { has } from 'lodash'
import moment from 'moment-es6'
import { Organization } from '../../../test/models/organization.model'
import { QueryRequest } from '../request/query/query-request'
import { DYNAMO_RX_MOCK } from '../request/query/query-request.spec'
import { ScanRequest } from '../request/scan/scan-request'
import { ConditionBuilder } from './condition-builder'

describe('condition builder', () => {
  describe('simple conditions', () => {
    it('equals', () => {
      const condition = ConditionBuilder.where('id').equals('equalsValue')
      expect(condition.statement).toBe('#id = :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':id')
      expect(condition.attributeMap[':id']).toEqual({ S: 'equalsValue' })
    })

    it('not equals', () => {
      const condition = ConditionBuilder.where('id').ne('notEqualsValue')
      expect(condition.statement).toBe('#id <> :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':id')
      expect(condition.attributeMap[':id']).toEqual({ S: 'notEqualsValue' })
    })

    it('greater than', () => {
      const condition = ConditionBuilder.where('count').gt(5)
      expect(condition.statement).toBe('#count > :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '5' })
    })

    it('greater than, equal', () => {
      const condition = ConditionBuilder.where('count').gte(10)
      expect(condition.statement).toBe('#count >= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '10' })
    })

    it('lower than', () => {
      const condition = ConditionBuilder.where('count').lt(100)
      expect(condition.statement).toBe('#count < :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '100' })
    })

    it('lower than, equal', () => {
      const condition = ConditionBuilder.where('count').lte(100)
      expect(condition.statement).toBe('#count <= :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':count')
      expect(condition.attributeMap[':count']).toEqual({ N: '100' })
    })

    it('attribute exists', () => {
      const condition = ConditionBuilder.where('attr').notNull()
      expect(condition.statement).toBe('attribute_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(0)
    })

    it('attribute not exists', () => {
      const condition = ConditionBuilder.where('attr').null()
      expect(condition.statement).toBe('attribute_not_exists (#attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(0)
    })

    it('attribute type', () => {
      const condition = ConditionBuilder.where('attr').type('S')
      expect(condition.statement).toBe('attribute_type (#attr, :attr)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#attr')
      expect(condition.attributeNames['#attr']).toBe('attr')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':attr')
      expect(condition.attributeMap[':attr']).toEqual({ S: 'S' })
    })

    it('begins with', () => {
      const condition = ConditionBuilder.where('textProp').beginsWith('te')
      expect(condition.statement).toBe('begins_with (#textProp, :textProp)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#textProp')
      expect(condition.attributeNames['#textProp']).toBe('textProp')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':textProp')
      expect(condition.attributeMap[':textProp']).toEqual({ S: 'te' })
    })

    it('contains', () => {
      const condition = ConditionBuilder.where('myCollection').contains(2)
      expect(condition.statement).toBe('contains (#myCollection, :myCollection)')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#myCollection')
      expect(condition.attributeNames['#myCollection']).toBe('myCollection')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':myCollection')
      expect(condition.attributeMap[':myCollection']).toEqual({ S: '2' })
    })

    it('in', () => {
      const condition = ConditionBuilder.where('myCollection').in(['myCollection', 'myOtherValue'])
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
      const condition = ConditionBuilder.where('counter').between(2, 5)
      expect(condition.statement).toBe('#counter BETWEEN :counter AND :counter_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#counter')
      expect(condition.attributeNames['#counter']).toBe('counter')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(2)
      expect(has(condition.attributeMap, ':counter')).toBeTruthy()
      expect(condition.attributeMap[':counter']).toEqual({ N: '2' })
      expect(has(condition.attributeMap, ':counter_2')).toBeTruthy()
      expect(condition.attributeMap[':counter_2']).toEqual({ N: '5' })
    })
  })

  describe('key condition', () => {
    it('partition key', () => {
      const condition = ConditionBuilder.wherePartitionKey('id', 'idValue')
      expect(condition.statement).toBe('#id = :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(1)
      expect(has(condition.attributeMap, ':id')).toBeTruthy()
      expect(condition.attributeMap[':id']).toEqual({ S: 'idValue' })
    })

    it('range key', () => {
      const condition = ConditionBuilder.whereRangeKey('count').equals(25)

      expect(condition.statement).toBe('#count = :count')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#count')
      expect(condition.attributeNames['#count']).toBe('count')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(1)
      expect(has(condition.attributeMap, ':count')).toBeTruthy()
      expect(condition.attributeMap[':count']).toEqual({ N: '25' })
    })

    it('range key (between moment dates)', () => {
      const date1 = moment('2017-03-17T20:00:00.000Z')
      const date2 = moment('2017-05-07T20:00:00.000Z')
      const condition = ConditionBuilder.whereRangeKey('creationDate').between(date1, date2)

      expect(condition.statement).toBe('#creationDate BETWEEN :creationDate AND :creationDate_2')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames).length).toBe(1)
      expect(Object.keys(condition.attributeNames)[0]).toBe('#creationDate')
      expect(condition.attributeNames['#creationDate']).toBe('creationDate')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap).length).toBe(2)
      expect(has(condition.attributeMap, ':creationDate')).toBeTruthy()
      expect(condition.attributeMap[':creationDate']).toEqual({
        S: date1
          .clone()
          .utc()
          .format(),
      })
      expect(has(condition.attributeMap, ':creationDate_2')).toBeTruthy()
      expect(condition.attributeMap[':creationDate_2']).toEqual({
        S: date2
          .clone()
          .utc()
          .format(),
      })
    })
  })

  describe('add condition to request', () => {
    it('range key', () => {
      const queryRequest = new QueryRequest(DYNAMO_RX_MOCK, Organization)
      ConditionBuilder.addRangeKeyCondition('count', queryRequest).equals(25)

      const params = queryRequest.params
      expect(params.KeyConditionExpression).toBe('(#count = :count)')
      expect(params.ExpressionAttributeNames).toEqual({ '#count': 'count' })
      expect(params.ExpressionAttributeValues).toEqual({ ':count': { N: '25' } })
    })

    it('between', () => {
      const start = moment().startOf('month')
      const end = moment().endOf('month')

      const scanRequest = new ScanRequest(DYNAMO_RX_MOCK, Organization)
      scanRequest.where('createdAtDate').between(start, end)

      const params = scanRequest.params
      expect(params.FilterExpression).toBe('(#createdAtDate BETWEEN :createdAtDate AND :createdAtDate_2)')
      expect(params.ExpressionAttributeNames).toBeDefined()
      expect(Object.keys(params.ExpressionAttributeNames).length).toBe(1)
      expect(params.ExpressionAttributeNames).toEqual({ '#createdAtDate': 'createdAtDate' })
      expect(params.ExpressionAttributeValues).toBeDefined()
      expect(Object.keys(params.ExpressionAttributeValues).length).toBe(2)
      expect(has(params.ExpressionAttributeValues, ':createdAtDate')).toBeTruthy()
      expect(params.ExpressionAttributeValues[':createdAtDate']).toEqual({
        S: start
          .clone()
          .utc()
          .format(),
      })
      expect(has(params.ExpressionAttributeValues, ':createdAtDate_2')).toBeTruthy()
      expect(params.ExpressionAttributeValues[':createdAtDate_2']).toEqual({
        S: end
          .clone()
          .utc()
          .format(),
      })
    })
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
