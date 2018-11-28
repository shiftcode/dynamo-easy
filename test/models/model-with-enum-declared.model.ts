import { Enum, Model, PartitionKey } from '../../src/dynamo-easy'
import { Type } from './types.enum'

@Model()
export class ModelWithEnumDeclared {
  @PartitionKey()
  id: string

  @Enum()
  type: Type
}
