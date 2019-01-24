import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

/**
 * Makes sure the property will be mapped to a L(ist) type. The modelConstructor is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 * @deprecated instead use @CollectionProperty({ itemType?: ModelConstructor })
 */
export function TypedArray<T>(modelConstructor?: ModelConstructor<T>): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: TypeInfo = {
        type: Array,
        isCustom: true,
      }

      if (modelConstructor) {
        typeInfo.genericType = modelConstructor
      }

      initOrUpdateProperty({ typeInfo }, target, propertyKey)
    }
  }
}
