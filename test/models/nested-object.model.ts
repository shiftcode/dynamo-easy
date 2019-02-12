import { DateProperty, Model } from '../../src/dynamo-easy'

@Model()
export class NestedObject {
  id: string

  @DateProperty({ name: 'my_date' })
  date?: Date
}
