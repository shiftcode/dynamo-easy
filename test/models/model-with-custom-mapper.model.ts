// tslint:disable:max-classes-per-file
// tslint:disable:no-non-null-assertion

import { CustomMapper, MapperForType, Model, PartitionKey, StringAttribute } from '../../src/dynamo-easy'

export class Id {
  counter: number
  year: number

  static parse(idString: string): Id {
    const id: Id = new Id()
    id.counter = parseInt(idString.slice(0, 4).replace('0', ''), 10)
    id.year = parseInt(idString.slice(4, 8), 10)
    return id
  }

  static unparse(propertyValue: Id): string {
    // create leading zeroes so the counter matches the pattern /d{4}
    const leadingZeroes: string = new Array(4 + 1 - (propertyValue.counter + '').length).join('0')
    return `${leadingZeroes}${propertyValue.counter}${propertyValue.year}`
  }

  constructor(counter?: number, year?: number) {
    this.counter = counter!
    this.year = year!
  }
}

export const IdMapper: MapperForType<Id, StringAttribute> = {
  fromDb: (attributeValue: StringAttribute) => Id.parse(attributeValue.S),
  toDb: (propertyValue: Id) => ({ S: `${Id.unparse(propertyValue)}` }),
}

@Model()
export class ModelWithCustomMapperModel {
  @CustomMapper(IdMapper)
  @PartitionKey()
  id: Id
}
