import { DateProperty, Model } from '../../src/dynamo-easy'

@Model({ tableName: 'NestedModelWithDate' })
export class NestedModelWithDate {
  @DateProperty()
  updated: Date
}
