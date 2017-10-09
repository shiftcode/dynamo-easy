import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { DateMapper } from './date.mapper'

describe('date mapper', () => {
  let dateMapper: DateMapper

  beforeEach(() => {
    dateMapper = new DateMapper()
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
    xit('simple', () => {
      const now = new Date()
      const fromDb = dateMapper.fromDb({ N: `${now.getTime()}` })

      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => {
        dateMapper.fromDb({ S: <any>'noDate' })
      }).toThrowError()
    })
  })
})
