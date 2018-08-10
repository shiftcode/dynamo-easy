import moment from 'moment-es6'
import { GSIPartitionKey } from '../../../src/decorator/impl/index/gsi-partition-key.decorator'
import { PartitionKey } from '../../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../../src/decorator/impl/model/model.decorator'

export const INDEX_CREATION_DATE = 'index-creationDate'

@Model({ tableName: 'forms' })
export class BaseForm {
  @PartitionKey()
  id: string

  @GSIPartitionKey(INDEX_CREATION_DATE)
  creationDate: moment.Moment
  lastSavedDate: moment.Moment
}
