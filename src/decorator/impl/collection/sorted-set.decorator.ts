import { ModelConstructor } from '../../../model'
import { TypeInfo } from '../../metadata'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

/**
 * Only the L(ist) dynamo datatype preservers the order of inserted items, so we have to make sure the L(ist) type is used
 * when persisting. The modelClass is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 */
export function SortedSet(modelClass?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: TypeInfo = {
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
