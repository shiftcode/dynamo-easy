// tslint:disable:max-classes-per-file
import { DateProperty, GSIPartitionKey, Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model({ tableName: 'ModelWithDateAsHashKey' })
export class ModelWithDateAsHashKey {
  @PartitionKey()
  @DateProperty()
  startDate: Date

  constructor(startDate: Date) {
    this.startDate = startDate
  }
}

@Model({ tableName: 'ModelWithDataAsRangeKey' })
export class ModelWithDateAsRangeKey {
  @PartitionKey()
  id: number

  @SortKey()
  @DateProperty()
  creationDate: Date

  constructor(id: number, creationDate: Date) {
    this.id = id
    this.creationDate = creationDate
  }
}

@Model({ tableName: 'ModelWithDateAsIndexHashKey' })
export class ModelWithDateAsIndexHashKey {
  @PartitionKey()
  id: number

  @GSIPartitionKey('anyGSI')
  @DateProperty()
  creationDate: Date

  constructor(id: number, creationDate: Date) {
    this.id = id
    this.creationDate = creationDate
  }
}
