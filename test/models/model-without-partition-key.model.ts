import { GSISortKey } from '../../src/decorator/impl/index/gsi-sort-key.decorator'
import { Model } from '../../src/decorator/impl/model/model.decorator'
import { Property } from '../../src/decorator/impl/property/property.decorator'

export const FAIL_MODEL_GSI = 'failModelGsi'

@Model()
export class ModelWithoutPartitionKeyModel {
  @Property()
  name: string

  @GSISortKey(FAIL_MODEL_GSI)
  gsiRange: string
}
