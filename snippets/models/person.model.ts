import { Model, PartitionKey } from '@shiftcoders/dynamo-easy'

@Model()
export class Person {
  @PartitionKey()
  id: string
  name: string
  yearOfBirth: number
}
