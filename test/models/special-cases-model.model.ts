import { CustomMapper, Model, PartitionKey } from '../../src/decorator/impl'
import { charArrayMapper } from './char-array.mapper'
import { Duration, durationMapper } from './duration.model'

@Model()
export class SpecialCasesModel {
  @PartitionKey()
  id: string

  @CustomMapper(charArrayMapper)
  myChars: string

  @CustomMapper(durationMapper)
  duration: Duration
}
