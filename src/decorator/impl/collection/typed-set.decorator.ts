import { Util } from '../../../mapper/util'
import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/property.decorator'

/**
 * Makes sure the property will be marshalled to a S(et) type. The modelClass is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 */
export function TypedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
      type: Set,
      isCustom: true,
    }

    if (modelClass) {
      typeInfo.genericTypes = [modelClass]
    }

    initOrUpdateProperty({ typeInfo }, target, propertyKey)
  }
}
