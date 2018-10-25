// tslint:disable:max-classes-per-file

import { DynamoDB } from 'aws-sdk'
import * as moment from 'moment'
import { PropertyMetadata, SortKey } from '../../src/decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { CustomMapper } from '../../src/decorator/impl/mapper/custom-mapper.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { MapperForType } from '../../src/mapper/for-type/base.mapper'

export class CustomId {
  private static MULTIPLIER = Math.pow(10, 5)
  private static FMT_DATE_NUM = 'YYYYMMDD'
  date: moment.Moment
  id: number

  static parse(value: number): CustomId {
    const date = Math.floor(value / CustomId.MULTIPLIER)
    const id = value - date * CustomId.MULTIPLIER
    return new CustomId(moment(date, CustomId.FMT_DATE_NUM), id)
  }

  static unparse(customId: CustomId): number {
    return parseInt(customId.date.format(CustomId.FMT_DATE_NUM), 10) * CustomId.MULTIPLIER + customId.id
  }

  constructor(date: moment.Moment, id: number) {
    this.date = date
    this.id = id
  }
}

export class CustomIdMapper implements MapperForType<CustomId> {
  fromDb(attributeValue: DynamoDB.AttributeValue, propertyMetadata?: PropertyMetadata<CustomId>): CustomId {
    return CustomId.parse(parseInt(attributeValue.N!, 10))
  }

  toDb(propertyValue: CustomId, propertyMetadata?: PropertyMetadata<CustomId>): DynamoDB.AttributeValue {
    return { N: `${CustomId.unparse(propertyValue)}` }
  }
}

@Model()
export class ModelWithCustomMapperForSortKeyModel {
  @PartitionKey()
  name: string

  @CustomMapper(CustomIdMapper)
  @SortKey()
  customId: CustomId

  constructor(name: string, id: CustomId) {
    this.name = name
    this.customId = id
  }
}
