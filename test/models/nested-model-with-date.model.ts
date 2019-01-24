import { DateProperty, Model } from '../../src/decorator/impl'

@Model()
export class NestedModelWithDate {
  @DateProperty()
  updated: Date
}
