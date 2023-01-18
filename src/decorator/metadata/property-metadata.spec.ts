import { dateToStringMapper } from '../../mapper/custom/date-to-string.mapper'
// tslint:disable:no-non-null-assertion
import { CollectionProperty } from '../impl/collection/collection-property.decorator'
import { DateProperty } from '../impl/date/date-property.decorator'
import { Model } from '../impl/model/model.decorator'
import { Property } from '../impl/property/property.decorator'
import { metadataForModel } from './metadata-for-model.function'
import { alterCollectionPropertyMetadataForSingleItem } from './property-metadata.model'

@Model()
class NestedModel {
  info: string

  @DateProperty()
  createdAt: Date
}

// tslint:disable-next-line:max-classes-per-file
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
