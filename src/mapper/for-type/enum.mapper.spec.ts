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

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = EnumMapper.toDb(Tags.ONE)
      expect(attributeValue).toEqual({ N: '0' })
    })

    it('should work', () => {
      const attributeValue = EnumMapper.toDb(Tags.ONE, propertyMetadata)
      expect(attributeValue).toEqual({ N: '0' })
    })

    it('should throw (not a valid enum value)', () => {
      expect(() => {
        EnumMapper.toDb(5, propertyMetadata)
      }).toThrowError()
    })

    it('should throw (string cannot be mapped)', () => {
      expect(() => {
        EnumMapper.toDb(<any>'enum')
      }).toThrowError()
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const enumValue = EnumMapper.fromDb({ N: '2' })
      expect(enumValue).toBe(Tags.THREE)
    })

    it('should work', () => {
      const enumValue = EnumMapper.fromDb({ N: '2' }, propertyMetadata)
      expect(enumValue).toBe(Tags.THREE)
    })

    it('should throw', () => {
      expect(() => EnumMapper.fromDb(<any>{ S: '2' }, propertyMetadata)).toThrow()
    })

    it('should throw', () => {
      expect(() => EnumMapper.fromDb(<any>{ S: '2' })).toThrow()
    })

    it('should throw', () => {
      enum anEnum {
        OK,
        NOK,
      }
      const meta: PropertyMetadata<any> = <any>{
        name: 'aName',
        nameDb: 'sameName',
        typeInfo: {
          type: String,
          genericType: anEnum,
        },
      }
      expect(() => EnumMapper.fromDb(<any>{ N: '2' }, <any>meta)).toThrow()
    })
  })
})
