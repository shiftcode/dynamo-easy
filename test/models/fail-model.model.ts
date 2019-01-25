import { Model } from '../../src/decorator/impl'

// tslint:disable:max-classes-per-file
import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { MapAttribute, MapperForType, StringAttribute } from '../../src/mapper'

const strangeMapper: MapperForType<FailModelNestedFail, MapAttribute> = {
  toDb: propertyValue => ({ M: { id: { S: `${propertyValue}` } } }),
  fromDb: attributeValue => ({ id: parseInt((<StringAttribute>attributeValue.M.id).S, 10) }),
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
