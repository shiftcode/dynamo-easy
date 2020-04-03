/* eslint-disable max-classes-per-file */
import { Model, Property } from '../../src/dynamo-easy'
import { Id, IdMapper } from './model-with-custom-mapper.model'

@Model()
export class NestedModelWithCustomMapper {
  @Property({ mapper: IdMapper })
  id: Id

  constructor() {
    this.id = new Id(9, 2010)
  }
}

@Model()
export class ModelWithNestedModelWithCustomMapper {
  @Property()
  nestedModel: NestedModelWithCustomMapper

  constructor() {
    this.nestedModel = new NestedModelWithCustomMapper()
  }
}
