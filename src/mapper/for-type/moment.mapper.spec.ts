import moment from 'moment-es6'
import { MomentMapper } from './moment.mapper'

describe('moment mapper', () => {
  let mapper: MomentMapper

  beforeEach(() => {
    mapper = new MomentMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const now = moment()
      const attributeValue = mapper.toDb(now)
      expect(attributeValue).toEqual({
        S: now
          .clone()
          .utc()
          .format(),
      })
    })

    it('should throw (invalid moment)', () => {
      expect(() => {
        mapper.toDb(<any>'noMomentDate')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const now = moment()
      const momentDate: moment.Moment = mapper.fromDb({
        S: now
          .clone()
          .utc()
          .format(),
      })
      expect(moment.isMoment(momentDate)).toBeTruthy()
      expect(momentDate.isValid()).toBeTruthy()
      expect(momentDate.format()).toBe(now.format())
    })

    it('should throw (no ISO-8601 string)', () => {
      expect(() => {
        mapper.fromDb({ S: '03.07.2017' })
      }).toThrowError()
    })
  })
})
