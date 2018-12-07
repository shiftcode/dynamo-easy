// tslint:disable:no-non-null-assertion
import { metadataForModel, Model, ModelMetadata } from '../..'
import { getMetaDataProperty } from '../../../../test/helper'
import { resetDynamoEasyConfig } from '../../../../test/helper/resetDynamoEasyConfig.function'
import { updateDynamoEasyConfig } from '../../../config'
import { DateToNumberMapper } from '../../../mapper/custom'
import { DateProperty } from './date.decorator'

@Model()
class ModelWithDate {
  @DateProperty()
  aDate: Date
}

describe('Date decorators should allow to use a different date mapper', () => {
  beforeEach(() => updateDynamoEasyConfig({ dateMapper: DateToNumberMapper }))
  afterEach(resetDynamoEasyConfig)

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
