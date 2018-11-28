import { NullMapper } from './null.mapper'

describe('null mapper', () => {
  describe('to db', () => {
    it('should work', () => {
      const attributeValue = NullMapper.toDb(null)
      expect(attributeValue).toEqual({ NULL: true })
    })

    it('should throw (invalid null value)', () => {
      expect(() => {
        NullMapper.toDb(<any>'stringValue')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const nullValue: null = NullMapper.fromDb({ NULL: true })
      expect(nullValue).toBe(null)
    })

    it('should throw (no null value)', () => {
      expect(() => {
        NullMapper.fromDb(<any>{ S: 'nullValue' })
      }).toThrowError()
    })
  })
})
