// tslint:disable:no-non-null-assertion
import { getMetaDataProperty } from '../../../../test/helper/get-meta-data-property.function'
import { resetDynamoEasyConfig } from '../../../../test/helper/resetDynamoEasyConfig.function'
import { updateDynamoEasyConfig } from '../../../config/update-config.function'
import { dateToNumberMapper } from '../../../mapper/custom/date-to-number.mapper'
import { metadataForModel } from '../../metadata/metadata-helper'
import { ModelMetadata } from '../../metadata/model-metadata.model'
import { Model } from '../model/model.decorator'
import { DateProperty } from './date-property.decorator'

@Model()
class ModelWithDate {
  @DateProperty()
  aDate: Date
}

describe('Date decorators should allow to use a different date mapper', () => {
  beforeEach(() => updateDynamoEasyConfig({ dateMapper: dateToNumberMapper }))
  afterEach(resetDynamoEasyConfig)

  it('should define the dateToNumberMapper in metadata', () => {
    const metaData: ModelMetadata<ModelWithDate> = metadataForModel(ModelWithDate).modelOptions

    expect(metaData).toBeDefined()
    expect(metaData.clazz).toBe(ModelWithDate)
    expect(metaData.properties).toBeDefined()

    const nameProp = getMetaDataProperty(metaData, 'aDate')

    expect(nameProp).toBeDefined()
    expect(nameProp!.name).toBe('aDate')
    expect(nameProp!.mapper).toBeDefined()
    expect(nameProp!.mapper!()).toBe(dateToNumberMapper)
  })
})
