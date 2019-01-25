import { DateProperty, Model } from '../../src/decorator/impl'

@Model()
export class NestedObject {
  id: string

  @DateProperty({ name: 'my_date' })
  date?: Date
}
