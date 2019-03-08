import { Model } from '../impl/model/model.decorator'
import { Property } from '../impl/property/property.decorator'
import { metadataForModel } from './metadata-for-model.function'

@Model({ tableName: 'ModelWithMetadata' })
class ModelWithMetadata {
  @Property({ name: 'myProp' })
  prop: string
}

describe('metadata helper', () => {
  it('should return metadata using either name or namedb as property name', () => {
    const modelOptionsWithName = metadataForModel(ModelWithMetadata).forProperty('prop')
    expect(modelOptionsWithName).toBeDefined()
    const modelOptionsWithNameDb = metadataForModel(ModelWithMetadata).forProperty('myProp')
    expect(modelOptionsWithNameDb).toBeDefined()
  })
})
