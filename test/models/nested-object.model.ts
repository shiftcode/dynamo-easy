import { DateProperty, Model } from '../../src/dynamo-easy'

@Model({ tableName: 'NestedObject' })
export class NestedObject {
  id: string

  @DateProperty({ name: 'my_date' })
  date?: Date
}
