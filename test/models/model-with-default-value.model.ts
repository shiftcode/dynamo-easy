import { Model, PartitionKey, Property } from '../../src/dynamo-easy'

@Model()
export class ModelWithDefaultValue {
  @PartitionKey()
  @Property({ defaultValueProvider: () => `generated-id-${Math.floor(Math.random() * 1000)}` })
  id: string
}
