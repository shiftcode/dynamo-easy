import { NumberMapper } from './number.mapper'

describe('number mapper', () => {
  let mapper: NumberMapper

  beforeEach(() => {
    mapper = new NumberMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = mapper.toDb(25)
      expect(attributeValue).toEqual({ N: '25' })
    })

    it('should throw (invalid number value)', () => {
      expect(() => {
        mapper.toDb(<any>'25')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const numberValue: number = mapper.fromDb({ N: '56' })
      expect(numberValue).toBe(56)
    })

    it('should throw (no number value)', () => {
      expect(() => {
        mapper.fromDb({ N: 'noNumber' })
      }).toThrowError()
    })

    it('should throw (no number value)', () => {
      expect(() => {
        mapper.fromDb(<any>{ S: '56' })
      }).toThrowError()
    })
  })
})
