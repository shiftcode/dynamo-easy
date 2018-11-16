import { Model, ModelMetadata } from '../..'
import { getMetaDataProperty } from '../../../../test/helper'
import { DynamoEasyConfig } from '../../../config'
import { DateToNumberMapper } from '../../../mapper/custom'
import { MetadataHelper } from '../../metadata/metadata-helper'
import { Date } from './date.decorator'

// important: it's necessary to update dynamo-easy-config BEFORE the models are loaded.
DynamoEasyConfig.updateConfig({ dateMapper: DateToNumberMapper })

@Model()
class ModelWithDate {
  @Date()
  aDate: Date
}

describe('Date decorators should allow to use a different date mapper', () => {
  it('should define the MomentMapper in metadata', () => {
    const metaData: ModelMetadata<ModelWithDate> = MetadataHelper.forModel(ModelWithDate)

    expect(metaData).toBeDefined()
    expect(metaData.clazz).toBe(ModelWithDate)
    expect(metaData.properties).toBeDefined()

    const nameProp = getMetaDataProperty(metaData, 'aDate')

    expect(nameProp).toBeDefined()
    expect(nameProp!.name).toBe('aDate')
    expect(nameProp!.mapper).toBe(DateToNumberMapper)
  })
})
