import { BooleanMapper } from './boolean.mapper'

describe('boolean mapper', () => {
  describe('to db', () => {
    it('should work (true)', () => {
      const attributeValue = BooleanMapper.toDb(true)
      expect(attributeValue).toEqual({ BOOL: true })
    })

    it('should work (false)', () => {
      const attributeValue = BooleanMapper.toDb(false)
      expect(attributeValue).toEqual({ BOOL: false })
    })

    it('should throw (string is not a valid boolean value)', () => {
      expect(() => {
        BooleanMapper.toDb(<any>'true')
      }).toThrowError()
    })

    it('should throw (string is not a valid boolean value)', () => {
      expect(() => {
        BooleanMapper.toDb(<any>1)
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work (true)', () => {
      const enumValue = BooleanMapper.fromDb({ BOOL: true })
      expect(enumValue).toBe(true)
    })

    it('should work (false)', () => {
      const enumValue = BooleanMapper.fromDb({ BOOL: false })
      expect(enumValue).toBe(false)
    })

    it('should throw (S cannot be mapped to boolean)', () => {
      expect(() => {
        BooleanMapper.fromDb(<any>{ S: 'true' })
      }).toThrowError()
    })

    it('should throw (N cannot be mapped to boolean)', () => {
      expect(() => {
        BooleanMapper.fromDb(<any>{ N: '1' })
      }).toThrowError()
    })
  })
})
