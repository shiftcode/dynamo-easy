// tslint:disable:max-classes-per-file
import * as moment from 'moment'
import { GSIPartitionKey, Model, PartitionKey, SortKey } from '../../src/decorator'
import { Date } from '../../src/decorator/impl/date/date.decorator'

@Model()
export class ModelWithMomentAsHashKey {
  @PartitionKey()
  @Date()
  startDate: moment.Moment

  constructor(startDate: moment.Moment) {
    this.startDate = startDate
  }
}

@Model()
export class ModelWithMomentAsRangeKey {
  @PartitionKey()
  id: number

  @SortKey()
  @Date()
  creationDate: moment.Moment

  constructor(id: number, creationDate: moment.Moment) {
    this.id = id
    this.creationDate = creationDate
  }
}

@Model()
export class ModelWithMomentAsIndexHashKey {
  @PartitionKey()
  id: number

  @GSIPartitionKey('anyGSI')
  @Date()
  creationDate: moment.Moment

  constructor(id: number, creationDate: moment.Moment) {
    this.id = id
    this.creationDate = creationDate
  }
}
