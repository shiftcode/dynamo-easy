import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { DateToNumberMapper } from './date-to-number.mapper'

describe('date mapper', () => {
  let dateMapper: DateToNumberMapper

  beforeEach(() => {
    dateMapper = new DateToNumberMapper()
  })

  describe('to db', () => {
    it('simple', () => {
      const now = new Date()
      const toDb: AttributeValue = dateMapper.toDb(now)

      expect(toDb).toEqual({ N: `${now.getTime()}` })
    })

    it('throws', () => {
      expect(() => {
        dateMapper.toDb(<any>'noDate')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('simple', () => {
      const now = new Date()
      const fromDb = dateMapper.fromDb({ N: `${now.getTime()}` })

      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => {
        dateMapper.fromDb(<any>{ S: 'noDate' })
      }).toThrowError()
    })
  })
})
