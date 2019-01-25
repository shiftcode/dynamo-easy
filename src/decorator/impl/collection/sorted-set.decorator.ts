import { ModelConstructor } from '../../../model'
import { TypeInfo } from '../../metadata'
import { initOrUpdateProperty } from '../property/init-or-update-property.function'

/**
 * Only the L(ist) dynamo datatype preservers the order of inserted items, so we have to make sure the L(ist) type is used
 * when persisting. The modelConstructor is required if the collection items
 * have some property decorators, so we can retrieve this information using the model class.
 * @deprecated instead use @CollectionProperty({ sorted: true, itemType?: ModelConstructor })
 */
export function SortedSet(modelConstructor?: ModelConstructor<any>): PropertyDecorator {
  return (target: any, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const typeInfo: TypeInfo = {
        type: Set
      }

      if (modelConstructor) {
        typeInfo.genericType = modelConstructor
      }

      initOrUpdateProperty({ isSortedCollection: true, typeInfo }, target, propertyKey)
    }
  }
}
