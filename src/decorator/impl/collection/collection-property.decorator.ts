/**
 * @module decorators
 */
import { MapperForType } from '../../../mapper/for-type/base.mapper'
import { BinaryAttribute, NumberAttribute, StringAttribute } from '../../../mapper/type/attribute.type'
import {
  wrapMapperForDynamoListJsArray,
  wrapMapperForDynamoListJsSet,
  wrapMapperForDynamoSetJsArray,
  wrapMapperForDynamoSetJsSet,
} from '../../../mapper/wrap-mapper-for-collection.function'
import { ModelConstructor } from '../../../model/model-constructor'
import { PropertyMetadata, TypeInfo } from '../../metadata/property-metadata.model'
import { getMetadataType } from '../../util'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'
import { CollectionPropertyData } from './collection-property-data.model'

export function CollectionProperty<R, T extends StringAttribute | NumberAttribute | BinaryAttribute>(
  opts: CollectionPropertyData<R, T> = {},
): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const type: ModelConstructor<any> = getMetadataType(target, propertyKey)

      if (type === undefined) {
        throw new Error(
          'make sure you have enabled the typescript compiler options which enable us to work with decorators (see doc)',
        )
      }

      if (type !== Set && type !== Array) {
        throw new Error(
          `[${target.constructor.name}::${propertyKey}] The CollectionProperty decorator is meant for properties of type Set or Array`,
        )
      }

      const meta: Partial<PropertyMetadata<any>> & { typeInfo: TypeInfo } = {
        name: propertyKey,
        nameDb: (opts && opts.name) || propertyKey,
        typeInfo: { type },
        isSortedCollection: !!opts.sorted,
      }

      const hasItemType = 'itemType' in opts && !!opts.itemType
      const hasItemMapper = 'itemMapper' in opts && !!opts.itemMapper

      if (hasItemMapper && hasItemType) {
        throw new Error(`[${target.constructor.name}::${propertyKey}] provide either itemType or itemMapper, not both`)
      }

      if (hasItemType) {
        meta.typeInfo.genericType = opts.itemType
      }

      if (hasItemMapper) {
        const itemMapper = <MapperForType<any, any>>opts.itemMapper

        const wrappedMapper: MapperForType<any, any> =
          type === Array
            ? !!opts.sorted
              ? wrapMapperForDynamoListJsArray(itemMapper)
              : wrapMapperForDynamoSetJsArray(itemMapper)
            : !!opts.sorted
            ? wrapMapperForDynamoListJsSet(itemMapper)
            : wrapMapperForDynamoSetJsSet(itemMapper)

        meta.mapper = () => wrappedMapper
        meta.mapperForSingleItem = () => itemMapper
      }

      initOrUpdateProperty(meta, target, propertyKey)
    }
  }
}
