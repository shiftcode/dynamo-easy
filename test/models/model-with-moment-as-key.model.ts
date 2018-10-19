// tslint:disable:max-classes-per-file
import * as moment from 'moment'
import { GSIPartitionKey, Model, PartitionKey, SortKey } from '../../src/decorator'

@Model()
export class ModelWithMomentAsHashKey {
  @PartitionKey()
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
  creationDate: moment.Moment

  constructor(id: number, creationDate: moment.Moment) {
    this.id = id
    this.creationDate = creationDate
  }
}
