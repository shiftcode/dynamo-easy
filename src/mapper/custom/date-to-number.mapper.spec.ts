import { MapperForType } from '../for-type/base.mapper'
import { NumberAttribute } from '../type/attribute.type'
import { dateToNumberMapper } from './date-to-number.mapper'

describe('date mapper', () => {
  let dateMapper: MapperForType<Date, NumberAttribute>

  beforeEach(() => {
    dateMapper = dateToNumberMapper
  })

  describe('to db', () => {
    it('simple', () => {
      const now = new Date()
      const toDb = dateMapper.toDb(now)

      expect(toDb).toBeDefined()
      expect(toDb).toEqual({ N: `${now.getTime()}` })
    })

    it('throws', () => {
      expect(() => dateMapper.toDb(<any>'noDate')).toThrowError()
    })
  })

  describe('from db', () => {
    it('simple', () => {
      const now = new Date()
      const fromDb = dateMapper.fromDb({ N: `${now.getTime()}` })
      expect(fromDb).toBeDefined()
      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => dateMapper.fromDb(<any>{ S: 'noDate' })).toThrowError()
    })
  })
})
