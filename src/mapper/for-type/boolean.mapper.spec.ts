import { BooleanMapper } from './boolean.mapper'

describe('boolean mapper', () => {
  let mapper: BooleanMapper

  beforeEach(() => {
    mapper = new BooleanMapper()
  })

  describe('to db', () => {
    it('should work (true)', () => {
      const attributeValue = mapper.toDb(true)
      expect(attributeValue).toEqual({ BOOL: true })
    })

    it('should work (false)', () => {
      const attributeValue = mapper.toDb(false)
      expect(attributeValue).toEqual({ BOOL: false })
    })

    it('should throw (string is not a valid boolean value)', () => {
      expect(() => {
        mapper.toDb(<any>'true')
      }).toThrowError()
    })

    it('should throw (string is not a valid boolean value)', () => {
      expect(() => {
        mapper.toDb(<any>1)
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work (true)', () => {
      const enumValue = mapper.fromDb({ BOOL: true })
      expect(enumValue).toBe(true)
    })

    it('should work (false)', () => {
      const enumValue = mapper.fromDb({ BOOL: false })
      expect(enumValue).toBe(false)
    })

    it('should throw (S cannot be mapped to boolean)', () => {
      expect(() => {
        mapper.fromDb(<any>{ S: 'true' })
      }).toThrowError()
    })

    it('should throw (N cannot be mapped to boolean)', () => {
      expect(() => {
        mapper.fromDb(<any>{ N: '1' })
      }).toThrowError()
    })
  })
})
