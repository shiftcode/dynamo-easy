import { StringMapper } from './string.mapper'

describe('string mapper', () => {
  describe('to db', () => {
    it('should work', () => {
      const attributeValue = StringMapper.toDb('myStringValue')
      expect(attributeValue).toEqual({ S: 'myStringValue' })
    })

    it('should work (empty string)', () => {
      const attributeValue = StringMapper.toDb('')
      expect(attributeValue).toBe(null)
    })

    it('should work (null)', () => {
      const attributeValue = StringMapper.toDb(<any>null)
      expect(attributeValue).toBe(null)
    })

    it('should work (undefined)', () => {
      const attributeValue = StringMapper.toDb(<any>undefined)
      expect(attributeValue).toBe(null)
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const stringValue = StringMapper.fromDb({ S: 'myStringValue' })
      expect(stringValue).toBe('myStringValue')
    })
  })
})
