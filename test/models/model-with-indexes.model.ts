// tslint:disable:max-classes-per-file
import moment from 'moment-es6'
import { GSIPartitionKey } from '../../src/decorator/impl/index/gsi-partition-key.decorator'
import { GSISortKey } from '../../src/decorator/impl/index/gsi-sort-key.decorator'
import { LSISortKey } from '../../src/decorator/impl/index/lsi-sort-key.decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { SortKey } from '../../src/decorator/impl/key/sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'

export const INDEX_ACTIVE = 'active-index'
@Model()
export class ModelWithGSI {
  @PartitionKey() id: string

  createdAt: moment.Moment

  @GSIPartitionKey(INDEX_ACTIVE) active: boolean
}

@Model()
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
