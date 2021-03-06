import { Model, PartitionKey, Property } from '../../src/dynamo-easy'
import { charArrayMapper } from './char-array.mapper'
import { Duration, durationMapper } from './duration.model'

@Model()
export class SpecialCasesModel {
  @PartitionKey()
  id: string

  @Property({ mapper: charArrayMapper })
  myChars: string

  @Property({ mapper: durationMapper })
  duration: Duration
}
