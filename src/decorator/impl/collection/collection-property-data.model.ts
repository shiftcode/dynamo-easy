import { BinaryAttribute, MapperForType, NumberAttribute, StringAttribute } from '../../../mapper'
import { ModelConstructor } from '../../../model'

export interface CollectionPropertyDataBase<R, T extends StringAttribute | NumberAttribute | BinaryAttribute> {
  /**
   * the name of property how it is named in dynamoDB
   */
  name?: string

  /**
   * if the collection should preserve the order. if so it will be stored as (L)ist
   */
  sorted?: boolean

  /**
   * provide an itemMapper if you want your complex items being mapped to String|Number|Binary attribute
   * (e.g. because you can't store it in a (S)et otherwise)
   * only provide either itemMapper or itemType --> not both
   * itemMapper is basically intended to be used with [S]et. though it also works with [L]ist
   */
  itemMapper?: MapperForType<R, T>

  /**
   * provide an itemType (class with @Model decorator) for complex types (eg. Set<ComplexType>)
   * collections with complex types will be stored as (L)ist
   * only provide either itemType or itemMapper --> not both
   */
  itemType?: ModelConstructor<any>
}
