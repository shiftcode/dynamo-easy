import { StringMapper } from './string.mapper'

describe('string mapper', () => {
  let mapper: StringMapper

  beforeEach(() => {
    mapper = new StringMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = mapper.toDb('myStringValue')
      expect(attributeValue).toEqual({ S: 'myStringValue' })
    })

    it('should work (empty string)', () => {
      const attributeValue = mapper.toDb('')
      expect(attributeValue).toBe(null)
    })

    it('should work (null)', () => {
      const attributeValue = mapper.toDb(<any>null)
      expect(attributeValue).toBe(null)
    })

    it('should work (undefined)', () => {
      const attributeValue = mapper.toDb(<any>undefined)
      expect(attributeValue).toBe(null)
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const stringValue = mapper.fromDb({ S: 'myStringValue' })
      expect(stringValue).toBe('myStringValue')
    })
  })
})
