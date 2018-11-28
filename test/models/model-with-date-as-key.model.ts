// tslint:disable:max-classes-per-file
import { Date, GSIPartitionKey, Model, PartitionKey, SortKey } from '../../src/dynamo-easy'

@Model()
export class ModelWithDateAsHashKey {
  @PartitionKey()
  @Date()
  startDate: Date

  constructor(startDate: Date) {
    this.startDate = startDate
  }
}

@Model()
export class ModelWithDateAsRangeKey {
  @PartitionKey()
  id: number

  @SortKey()
  @Date()
  creationDate: Date

  constructor(id: number, creationDate: Date) {
    this.id = id
    this.creationDate = creationDate
  }
}

@Model()
export class ModelWithDateAsIndexHashKey {
  @PartitionKey()
  id: number

  @GSIPartitionKey('anyGSI')
  @Date()
  creationDate: Date

  constructor(id: number, creationDate: Date) {
    this.id = id
    this.creationDate = creationDate
  }
}
