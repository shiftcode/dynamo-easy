import { DateProperty, GSIPartitionKey, Model, PartitionKey } from '../../../src/dynamo-easy'

export const INDEX_CREATION_DATE = 'index-creationDate'

@Model({ tableName: 'forms' })
export class BaseForm {
  @PartitionKey()
  id: string

  @GSIPartitionKey(INDEX_CREATION_DATE)
  @DateProperty()
  creationDate: Date

  @DateProperty()
  lastSavedDate: Date
}
