// tslint:disable:no-non-null-assertion
import { metadataForModel, Model, ModelMetadata } from '../..'
import { getMetaDataProperty } from '../../../../test/helper'
import { updateDynamoEasyConfig } from '../../../config'
import { DateToNumberMapper } from '../../../mapper/custom'
import { Date } from './date.decorator'

// important: it's necessary to update dynamo-easy-config BEFORE the models are loaded.
updateDynamoEasyConfig({ dateMapper: DateToNumberMapper })

@Model()
class ModelWithDate {
  @Date()
  aDate: Date
}

describe('Date decorators should allow to use a different date mapper', () => {
  it('should define the DateToNumberMapper in metadata', () => {
    const metaData: ModelMetadata<ModelWithDate> = metadataForModel(ModelWithDate)

    expect(metaData).toBeDefined()
    expect(metaData.clazz).toBe(ModelWithDate)
    expect(metaData.properties).toBeDefined()

    const nameProp = getMetaDataProperty(metaData, 'aDate')

    expect(nameProp).toBeDefined()
    expect(nameProp!.name).toBe('aDate')
    expect(nameProp!.mapper).toBeDefined()
    expect(nameProp!.mapper!()).toBe(DateToNumberMapper)
  })
})
