import { NumberMapper } from './number.mapper'

describe('number mapper', () => {
  describe('to db', () => {
    it('should work', () => {
      const attributeValue = NumberMapper.toDb(25)
      expect(attributeValue).toEqual({ N: '25' })
    })

    it('should throw (invalid number value)', () => {
      expect(() => {
        NumberMapper.toDb(<any>'25')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const numberValue: number = NumberMapper.fromDb({ N: '56' })
      expect(numberValue).toBe(56)
    })

    it('should throw (no number value)', () => {
      expect(() => {
        NumberMapper.fromDb({ N: 'noNumber' })
      }).toThrowError()
    })

    it('should throw (no number value)', () => {
      expect(() => {
        NumberMapper.fromDb(<any>{ S: '56' })
      }).toThrowError()
    })
  })
})
