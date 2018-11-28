import { Enum, Model, PartitionKey } from '../../src/dynamo-easy'
import { Type } from './types.enum'

@Model()
export class ModelWithTypedEnumDeclared {
  @PartitionKey()
  id: string

  @Enum(Type)
  type: Type
}
