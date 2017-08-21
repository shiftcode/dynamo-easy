import { MetadataHelper } from './metadata-helper'
import { Model } from './model.decorator'
import { Property } from './property.decorator'

@Model()
class ModelWithMetadata {
  @Property({ name: 'myProp' })
  prop: string
}

describe('metadata helper', () => {
  it('should return metadata using either name or namedb as property name', () => {
    const modelOptionsWithName = MetadataHelper.forProperty(ModelWithMetadata, 'prop')
    expect(modelOptionsWithName).toBeDefined()
    const modelOptionsWithNameDb = MetadataHelper.forProperty(ModelWithMetadata, 'myProp')
    expect(modelOptionsWithNameDb).toBeDefined()
  })
})
