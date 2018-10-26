// tslint:disable:max-classes-per-file
import { GSIPartitionKey } from '../../src/decorator'
import { PartitionKey } from '../../src/decorator/impl/key/partition-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model()
export class ModelWithoutCustomMapper {
  @PartitionKey()
  id: { key: string; value: string }

  otherVal: string

  constructor(key: string, value: string, otherValue: string) {
    this.id = { key, value }
    this.otherVal = otherValue
  }
}

@Model()
export class ModelWithoutCustomMapperOnIndex {
  @PartitionKey()
  id: string

  @GSIPartitionKey('anyGSI')
  gsiPk: { key: string; value: string }

  constructor(id: string, key: string, value: string) {
    this.id = id
    this.gsiPk = { key, value }
  }
}
