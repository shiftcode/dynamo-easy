import { dateToStringMapper } from '../../mapper/custom/date-to-string.mapper'
// tslint:disable:no-non-null-assertion
import { CollectionProperty } from '../impl/collection/collection-property.decorator'
import { Model } from '../impl/model/model.decorator'
import { Property } from '../impl/property/property.decorator'
import { metadataForProperty } from './metadata-helper'
import { alterCollectionPropertyMetadataForSingleItem } from './property-metadata.model'

@Model()
class TestModel {
  @CollectionProperty()
  myStringArray: string[]

  @CollectionProperty({ itemMapper: dateToStringMapper })
  myDateSet: Set<Date>

  @Property()
  myString: string
}

describe('alterCollectionPropertyMetadataForSingleItem', () => {
  it('should return undefined when no itemMapper is defined', () => {
    const propMeta = metadataForProperty(TestModel, 'myStringArray')!
    expect(propMeta.mapperForSingleItem).toBeUndefined()
    expect(alterCollectionPropertyMetadataForSingleItem(propMeta)).toBeUndefined()
  })

  it('should set the mapper for a single value when using itemMapper', () => {
    const propMeta = metadataForProperty(TestModel, 'myDateSet')!
    expect(propMeta.mapper).toBeDefined()
    expect(propMeta.mapperForSingleItem).toBeDefined()

    const alteredPropMeta = alterCollectionPropertyMetadataForSingleItem(propMeta)

    expect(alteredPropMeta).toBeDefined()
    expect(alteredPropMeta!.mapper).toBe(propMeta.mapperForSingleItem)
  })

  it('should not alter when non-collection', () => {
    const propMeta = metadataForProperty(TestModel, 'myString')
    expect(propMeta).toBeDefined()

    const alteredPropMeta = alterCollectionPropertyMetadataForSingleItem(propMeta)
    expect(alteredPropMeta).toEqual(propMeta)
  })

  it('should not throw when undefined or null was provided but return undefined', () => {
    expect(alterCollectionPropertyMetadataForSingleItem()).toBe(undefined)
    expect(alterCollectionPropertyMetadataForSingleItem(null)).toBe(undefined)
  })
})
