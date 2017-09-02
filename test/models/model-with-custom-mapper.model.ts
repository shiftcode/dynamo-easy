// tslint:disable:max-classes-per-file
import { AttributeValue } from 'aws-sdk/clients/dynamodb'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { CustomMapper } from '../../src/decorator/impl/mapper/custom-mapper.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { PropertyMetadata } from '../../src/decorator/metadata/property-metadata.model'
import { MapperForType } from '../../src/mapper/for-type/base.mapper'

export class Id {
  counter: number
  year: number

  constructor(counter?: number, year?: number) {
    this.counter = counter
    this.year = year
  }
}

export class IdMapper implements MapperForType<Id> {
  fromDb(attributeValue: AttributeValue, propertyMetadata?: PropertyMetadata<any>): Id {
    const id: Id = new Id()

    const idString = attributeValue.S
    id.counter = parseInt(idString.slice(0, 4).replace('0', ''), 10)
    id.year = parseInt(idString.slice(4, 8), 10)

    return id
  }

  toDb(propertyValue: Id, propertyMetadata?: PropertyMetadata<any>): AttributeValue {
    // create leading zeroes so the counter matches the pattern /d{4}
    const leadingZeroes: string = new Array(4 + 1 - (propertyValue.counter + '').length).join('0')
    return {
      S: `${leadingZeroes}${propertyValue.counter}${propertyValue.year}`,
    }
  }
}

@Model()
export class ModelWithCustomMapperModel {
  @CustomMapper(IdMapper)
  @PartitionKey()
  id: Id
}
