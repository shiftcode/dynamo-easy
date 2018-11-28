import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'
import { StringType, Type } from './types.enum'

@Model()
export class ModelWithEnum {
  @PartitionKey()
  id: string

  @Property()
  type: Type

  @Property()
  strType: StringType
}
