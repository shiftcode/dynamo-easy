import { Model } from '../../src/decorator/impl'
import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { NestedModelWithDate } from './nested-model-with-date.model'
import { NestedObject } from './nested-object.model'
import { FormId, formIdMapper } from './real-world'

@Model()
export class ModelWithCollections {
  // ================================================================
  // should be mapped to (L)ist of (M)aps since itemType is complex
  @CollectionProperty({ itemType: NestedModelWithDate })
  arrayOfNestedModelToList: NestedModelWithDate[]

  @CollectionProperty({ itemType: NestedModelWithDate })
  setOfNestedModelToList: Set<NestedModelWithDate>

  // ==============================================================================
  // should be mapped to (L)ist of (S)trings since it needs to preserve the order
  @CollectionProperty({ sorted: true, itemMapper: formIdMapper })
  arrayOfFormIdToListWithStrings: FormId[]

  @CollectionProperty({ sorted: true, itemMapper: formIdMapper })
  setOfFormIdToListWithStrings: Set<FormId>

  // ===========================================================================
  // should be mapped to (L)ist of (M)aps since it complex type without mapper
  @CollectionProperty()
  arrayOfObjectsToList: NestedObject[]

  @CollectionProperty()
  setOfObjectsToList: Set<NestedObject>

  // ====================================================================
  // should be mapped to (String)(S)et since the itemMapper is provided
  @CollectionProperty({ itemMapper: formIdMapper })
  arrayOfFormIdToSet: FormId[]

  @CollectionProperty({ itemMapper: formIdMapper })
  setOfFormIdToSet: Set<FormId>

  // should be mapped to List since it is an array
  @CollectionProperty()
  arrayOfStringToSet: string[]

  // should be mapped to Set
  @CollectionProperty()
  setOfStringToSet: Set<string>
}
