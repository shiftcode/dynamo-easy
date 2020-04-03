/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { dateToStringMapper } from './date-to-string.mapper'

describe('dateToStringMapper', () => {
  describe('to db', () => {
    it('simple', () => {
      const now = new Date()
      const toDb = dateToStringMapper.toDb(now)
      expect(toDb).toBeDefined()
      expect(toDb!.S).toBeDefined()
      expect(toDb!.S).toEqual(`${now.toISOString()}`)
    })

    it('throws', () => {
      expect(() => dateToStringMapper.toDb(<any>'noDate')).toThrowError()
    })
  })

  describe('from db', () => {
    it('simple', () => {
      const now = new Date()
      const fromDb = dateToStringMapper.fromDb({ S: `${now.toISOString()}` })

      expect(fromDb).toEqual(now)
    })

    it('throws', () => {
      expect(() => dateToStringMapper.fromDb(<any>{ N: '4545' })).toThrowError()
      expect(() => dateToStringMapper.fromDb(<any>{ S: 'noDate' })).toThrowError()
    })
  })
})
