import { Model, PartitionKey, Property } from '../../src/dynamo-easy'
import { StringType, Type } from './types.enum'

@Model({ tableName: 'ModelWithEnum' })
export class ModelWithEnum {
  @PartitionKey()
  id: string

  @Property()
  type: Type

  @Property()
  strType: StringType
}

@Model({ tableName: 'ModelWithNonDecoratedEnum' })
export class ModelWithNonDecoratedEnum {
  @PartitionKey()
  id: string

  type: Type

  strType: StringType
}
