import { Model, PartitionKey } from '../../src/decorator/impl'

@Model()
export class ModelWithEmptyValues {
  @PartitionKey()
  id: string

  name: string

  roles: Set<string>

  createdAt: Date | null

  lastNames: string[]

  details: { info?: string }
}
