/* eslint-disable max-classes-per-file */
import { CollectionProperty, MapAttribute, MapperForType, Model, StringAttribute } from '../../src/dynamo-easy'

const strangeMapper: MapperForType<FailModelNestedFail, MapAttribute> = {
  toDb: (propertyValue) => ({ M: { id: { S: `${propertyValue}` } } }),
  fromDb: (attributeValue) => ({ id: parseInt((<StringAttribute>attributeValue.M.id).S, 10) }),
}

class FailModelNestedFail {
  id: number
}

@Model()
export class FailModel {
  // array <-> (S)et
  @CollectionProperty({ itemMapper: <any>strangeMapper })
  myFail: FailModelNestedFail[]
}
