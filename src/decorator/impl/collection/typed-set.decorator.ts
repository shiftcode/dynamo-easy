import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

/**
 * Makes sure the property will be marshalled to a S(et) type. The modelConstructor is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 * @deprecated instead use @CollectionProperty({ itemType?: modelConstructor })
 */
export function TypedSet(modelConstructor?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: TypeInfo = {
        type: Set,
        isCustom: true,
      }

      if (modelConstructor) {
        typeInfo.genericType = modelConstructor
      }

      initOrUpdateProperty({ typeInfo }, target, propertyKey)
    }
  }
}
