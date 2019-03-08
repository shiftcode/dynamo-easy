import { Model, PartitionKey } from '@shiftcoders/dynamo-easy'

@Model({tableName: 'persons'})
export class Person {
  @PartitionKey()
  id: string
  name: string
  yearOfBirth: number
}
