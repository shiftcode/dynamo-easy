// tslint:disable:max-classes-per-file
import { GSIPartitionKey, Model, PartitionKey, SortKey } from '../../src/decorator'
import { Date } from '../../src/decorator/impl/date/date.decorator'

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
