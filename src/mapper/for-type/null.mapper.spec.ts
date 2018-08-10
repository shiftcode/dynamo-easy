import { NullMapper } from './null.mapper'

describe('null mapper', () => {
  let mapper: NullMapper

  beforeEach(() => {
    mapper = new NullMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = mapper.toDb(null)
      expect(attributeValue).toEqual({ NULL: true })
    })

    it('should throw (invalid null value)', () => {
      expect(() => {
        mapper.toDb(<any>'stringValue')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const nullValue: null = mapper.fromDb({ NULL: true })
      expect(nullValue).toBe(null)
    })

    it('should throw (no null value)', () => {
      expect(() => {
        mapper.fromDb({ S: 'nullValue' })
      }).toThrowError()
    })
  })
})
