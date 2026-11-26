import { dateToStringMapper } from '../../mapper/custom/date-to-string.mapper'

import { CollectionProperty } from '../impl/collection/collection-property.decorator'
import { DateProperty } from '../impl/date/date-property.decorator'
import { Model } from '../impl/model/model.decorator'
import { Property } from '../impl/property/property.decorator'
import { metadataForModel } from './metadata-for-model.function'
import { alterCollectionPropertyMetadataForSingleItem, hasType } from './property-metadata.model'

@Model()
class NestedModel {
  info: string

  @DateProperty()
  createdAt: Date
}

@Model()
class TestModel {
  @CollectionProperty()
  myStringArray: string[]

  @CollectionProperty({ itemType: NestedModel })
  myCustomArray: NestedModel[]

  @CollectionProperty({ itemMapper: dateToStringMapper })
  myDateSet: Set<Date>

  @Property()
  myString: string

  @Property()
  myNested: NestedModel

  // typescript emits `Object` as design type for the following properties
  @Property()
  myNullableString: string | null

  @Property()
  myNullableNested: NestedModel | null

  @Property()
  myAny: any

  @Property()
  myInterface: { foo: string }

  // no decorator -> no property metadata
  myUndecorated: string
}

describe('alterCollectionPropertyMetadataForSingleItem', () => {
  it('should return undefined when no itemMapper is defined', () => {
    const propMeta = metadataForModel(TestModel).forProperty('myStringArray')!
    expect(propMeta.mapperForSingleItem).toBeUndefined()
    expect(alterCollectionPropertyMetadataForSingleItem(propMeta)).toBeUndefined()
  })

  it('should set the type for a single value when using itemType', () => {
    const propMeta = metadataForModel(TestModel).forProperty('myCustomArray')!
    expect(propMeta.typeInfo).toBeDefined()
    expect(propMeta.typeInfo!.type).toBe(Array)
    expect(propMeta.typeInfo!.genericType).toBe(NestedModel)

    const alteredPropMeta = alterCollectionPropertyMetadataForSingleItem(propMeta)

    expect(alteredPropMeta).toBeDefined()
    expect(alteredPropMeta!.typeInfo).toBeDefined()
    expect(alteredPropMeta!.typeInfo!.type).toBe(NestedModel)
  })

  it('should set the mapper for a single value when using itemMapper', () => {
    const propMeta = metadataForModel(TestModel).forProperty('myDateSet')!
    expect(propMeta.mapper).toBeDefined()
    expect(propMeta.mapperForSingleItem).toBeDefined()

    const alteredPropMeta = alterCollectionPropertyMetadataForSingleItem(propMeta)

    expect(alteredPropMeta).toBeDefined()
    expect(alteredPropMeta!.mapper).toBe(propMeta.mapperForSingleItem)
  })

  it('should not alter when non-collection', () => {
    const propMeta = metadataForModel(TestModel).forProperty('myString')
    expect(propMeta).toBeDefined()

    const alteredPropMeta = alterCollectionPropertyMetadataForSingleItem(propMeta)
    expect(alteredPropMeta).toEqual(propMeta)
  })

  it('should have metadata for custom type array', () => {
    const propMeta = metadataForModel(TestModel).forProperty('myCustomArray[0].createdAt')
    expect(propMeta).toBeDefined()
    expect(propMeta!.typeInfo).toBeDefined()
    expect(propMeta!.typeInfo!.type).toBe(Date)
    expect(propMeta!.mapper).toBeDefined()
    expect(propMeta!.mapper!()).toBe(dateToStringMapper)
  })

  it('should not throw when undefined or null was provided but return undefined', () => {
    expect(alterCollectionPropertyMetadataForSingleItem()).toBe(undefined)
    expect(alterCollectionPropertyMetadataForSingleItem(null)).toBe(undefined)
  })
})

describe('hasType', () => {
  const metadata = metadataForModel(TestModel)

  it('should return false when no property metadata was provided', () => {
    expect(hasType()).toBe(false)
    expect(hasType(metadata.forProperty('myUndecorated'))).toBe(false)
  })

  it('should return false when property metadata has no typeInfo', () => {
    expect(hasType({ name: 'foo', nameDb: 'foo' })).toBe(false)
  })

  it('should return false when type is Object', () => {
    expect(hasType({ name: 'foo', nameDb: 'foo', typeInfo: { type: Object } })).toBe(false)
  })

  it.each([String, Number, Boolean, Date, Array, Set, NestedModel].map((type) => ({ type })))(
    'should return true for explicit type $type.name',
    ({ type }) => {
      expect(hasType({ name: 'foo', nameDb: 'foo', typeInfo: { type } })).toBe(true)
    },
  )

  it.each(['myString', 'myNested', 'myStringArray', 'myCustomArray', 'myDateSet'] satisfies Array<keyof TestModel>)(
    'should return true for decorated property %s with a concrete design type',
    (prop) => {
      expect(hasType(metadata.forProperty(prop))).toBe(true)
    },
  )

  it.each(['myNullableString', 'myNullableNested', 'myAny', 'myInterface'] satisfies Array<keyof TestModel>)(
    'should return false for decorated property %s with design type Object (nullable unions, any, interfaces)',
    (prop) => {
      const propMeta = metadata.forProperty(prop)
      expect(propMeta?.typeInfo?.type).toBe(Object)
      expect(hasType(propMeta)).toBe(false)
    },
  )
})
