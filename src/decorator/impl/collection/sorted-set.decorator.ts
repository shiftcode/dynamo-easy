import { ModelConstructor } from '../../../model/model-constructor'
import { TypeInfo } from '../../metadata/property-metadata.model'
import { initOrUpdateProperty } from '../property/property.decorator'

/**
 * Only the L(ist) dynamo datatype preservers the order of inserted items, so we have to make sure the L(ist) type is used
 * when persisting. The modelClass is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 */
export function SortedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
        type: Set,
        isCustom: true,
      }

      if (modelClass) {
        typeInfo.genericType = modelClass
      }

      initOrUpdateProperty({ isSortedCollection: true, typeInfo }, target, propertyKey)
    }
  }
}
