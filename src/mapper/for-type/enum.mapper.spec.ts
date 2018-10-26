import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { NumberAttribute } from '../type/attribute.type'
import { EnumMapper } from './enum.mapper'

enum Tags {
  ONE,
  TWO,
  THREE,
}

describe('enum mapper', () => {
  const propertyMetadata: PropertyMetadata<any, NumberAttribute> = <any>{
    typeInfo: {
      genericType: Tags,
    },
  }

  let mapper: EnumMapper<Tags>

  beforeEach(() => {
    mapper = new EnumMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = mapper.toDb(Tags.ONE)
      expect(attributeValue).toEqual({ N: '0' })
    })

    it('should work', () => {
      const attributeValue = <NumberAttribute>mapper.toDb(Tags.ONE, propertyMetadata)
      expect(attributeValue).toEqual({ N: '0' })
    })

    it('should throw (not a valid enum value)', () => {
      expect(() => {
        mapper.toDb(5, propertyMetadata)
      }).toThrowError()
    })

    it('should throw (string cannot be mapped)', () => {
      expect(() => {
        mapper.toDb(<any>'enum')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const enumValue = mapper.fromDb({ N: '2' })
      expect(enumValue).toBe(Tags.THREE)
    })

    it('should work', () => {
      const enumValue = mapper.fromDb({ N: '2' }, propertyMetadata)
      expect(enumValue).toBe(Tags.THREE)
    })

    it('should throw', () => {
      expect(() => {
        mapper.fromDb(<any>{ S: '2' }, propertyMetadata)
      }).toThrowError()
    })

    it('should throw', () => {
      expect(() => {
        mapper.fromDb(<any>{ S: '2' })
      }).toThrowError()
    })
  })
})
