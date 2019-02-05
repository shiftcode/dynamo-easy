import { DateProperty, Model } from '../../src/dynamo-easy'

@Model()
export class NestedModelWithDate {
  @DateProperty()
  updated: Date
}
