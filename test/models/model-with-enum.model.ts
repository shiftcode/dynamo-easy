import { Model, PartitionKey, Property } from '../../src/dynamo-easy'
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

@Model()
export class ModelWithNonDecoratedEnum {
  @PartitionKey()
  id: string

  type: Type

  strType: StringType
}
