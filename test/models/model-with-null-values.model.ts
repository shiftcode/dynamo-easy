import { CollectionProperty, GSIPartitionKey, Model, PartitionKey, Property } from '../../src/dynamo-easy'
import { Id, IdMapper } from './model-with-custom-mapper.model'

@Model()
export class NestedModelWithNullValue {
  @Property()
  name: string | null
}

@Model()
export class ModelWithNullValues {
  @PartitionKey()
  id: string

  @Property()
  name: string | null

  @Property({ name: 'renamed_age' })
  age: number | null

  @Property()
  nested: NestedModelWithNullValue | null

  @CollectionProperty({ itemType: NestedModelWithNullValue })
  nestedList: Array<NestedModelWithNullValue | null>

  @Property({ mapper: IdMapper })
  customId: Id | null

  @GSIPartitionKey('anyGSI')
  gsiPk?: string | null

  untyped: any
}
