import moment from 'moment'
import { GSIPartitionKey } from '../../src/decorator/gsi-partition-key.decorator'
import { GSISortKey } from '../../src/decorator/gsi-sort-key.decorator'
import { LSISortKey } from '../../src/decorator/lsi-sort-key.decorator'
import { Model } from '../../src/decorator/model.decorator'
import { PartitionKey } from '../../src/decorator/partition-key.decorator'
import { SortKey } from '../../src/decorator/sort-key.decorator'
import { Property } from '../../src/decorator/property.decorator'

export const INDEX_ACTIVE = 'active-index'

@Model()
export class ModelWithGSI {
  @PartitionKey() id: string

  createdAt: moment.Moment

  @GSIPartitionKey(INDEX_ACTIVE) active: boolean
}

export class ModelWithLSI {
  @PartitionKey() id: string

  createdAt: moment.Moment

  @LSISortKey(INDEX_ACTIVE) active: boolean
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
  createdAt: moment.Moment

  @GSIPartitionKey(INDEX_ACTIVE_CREATED_AT) active: boolean

  @LSISortKey(INDEX_COUNT) count: number
}

@Model()
export class DifferentModel {
  @PartitionKey() id: string

  @GSISortKey(INDEX_ACTIVE) createdAt: boolean

  @GSIPartitionKey(INDEX_ACTIVE) active: boolean
}

@Model()
export class ModelWithWrongIndexes {
  @PartitionKey() id: string

  @GSISortKey(INDEX_ACTIVE) createdAt: boolean

  @GSIPartitionKey(INDEX_ACTIVE) active: boolean

  // @GSISortKey(INDEX_ACTIVE)
  otherField: string
}
