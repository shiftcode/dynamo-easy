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
