// tslint:disable:max-classes-per-file
import {
  DateProperty,
  GSIPartitionKey,
  GSISortKey,
  LSISortKey,
  Model,
  PartitionKey,
  Property,
  SortKey,
} from '../../src/dynamo-easy'

export const INDEX_ACTIVE = 'active-index'

@Model()
export class ModelWithGSI {
  @PartitionKey()
  id: string

  @DateProperty()
  createdAt: Date

  @GSIPartitionKey(INDEX_ACTIVE)
  active: boolean
}

@Model()
export class ModelWithLSI {
  @PartitionKey()
  id: string

  @DateProperty()
  createdAt: Date

  @LSISortKey(INDEX_ACTIVE)
  active: boolean
}

export const INDEX_COUNT = 'count-index'
export const INDEX_ACTIVE_CREATED_AT = 'active-createdAt-index'

@Model()
export class ModelWithABunchOfIndexes {
  @Property({ name: 'myId' })
  @PartitionKey()
  id: string

  @SortKey()
  @GSISortKey(INDEX_ACTIVE_CREATED_AT)
  @DateProperty()
  createdAt: Date

  @GSIPartitionKey(INDEX_ACTIVE_CREATED_AT)
  active: boolean

  @LSISortKey(INDEX_COUNT)
  count: number
}

@Model()
export class DifferentModel {
  @PartitionKey()
  id: string

  @GSISortKey(INDEX_ACTIVE)
  createdAt: boolean

  @GSIPartitionKey(INDEX_ACTIVE)
  active: boolean
}

@Model()
export class ModelWithWrongIndexes {
  @PartitionKey()
  id: string

  @GSISortKey(INDEX_ACTIVE)
  createdAt: boolean

  @GSIPartitionKey(INDEX_ACTIVE)
  active: boolean

  // @GSISortKey(INDEX_ACTIVE)
  otherField: string
}
