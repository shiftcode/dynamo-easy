import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { DateToStringMapper } from './date-to-string.mapper'

describe('DateToStringMapper', () => {
  let dateMapper: DateToStringMapper

  beforeEach(() => (dateMapper = new DateToStringMapper()))

  describe('to db', () => {
    it('simple', () => {
      const now = new Date()
      const toDb: AttributeValue = dateMapper.toDb(now)
      expect(toDb).toBeDefined()
      expect(toDb['S']).toBeDefined()
      expect(toDb['S']).toEqual(`${now.toISOString()}`)
    })

    it('throws', () => {
      expect(() => dateMapper.toDb(<any>'noDate')).toThrowError()
    })
  })

  describe('from db', () => {
    it('simple', () => {
      const now = new Date()
      const fromDb = dateMapper.fromDb({ S: `${now.toISOString()}` })

      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => dateMapper.fromDb(<any>{ N: '4545' })).toThrowError()
      expect(() => dateMapper.fromDb(<any>{ S: 'noDate' })).toThrowError()
    })
  })
})
