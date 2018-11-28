// tslint:disable:no-non-null-assertion
import { DateToStringMapper } from './date-to-string.mapper'

describe('DateToStringMapper', () => {
  describe('to db', () => {
    it('simple', () => {
      const now = new Date()
      const toDb = DateToStringMapper.toDb(now)
      expect(toDb).toBeDefined()
      expect(toDb!.S).toBeDefined()
      expect(toDb!.S).toEqual(`${now.toISOString()}`)
    })

    it('throws', () => {
      expect(() => DateToStringMapper.toDb(<any>'noDate')).toThrowError()
    })
  })

  describe('from db', () => {
    it('simple', () => {
      const now = new Date()
      const fromDb = DateToStringMapper.fromDb({ S: `${now.toISOString()}` })

      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => DateToStringMapper.fromDb(<any>{ N: '4545' })).toThrowError()
      expect(() => DateToStringMapper.fromDb(<any>{ S: 'noDate' })).toThrowError()
    })
  })
})
