// tslint:disable:max-classes-per-file
import { PropertyMetadata } from '../../../src/decorator'
import { MapperForType } from '../../../src/mapper'
import { ListAttribute, StringAttribute } from '../../../src/mapper/type/attribute.type'
import { FormId } from './form-id.model'

export class FormIdMapper implements MapperForType<FormId, StringAttribute> {
  fromDb(attributeValue: StringAttribute, propertyMetadata?: PropertyMetadata<FormId>): FormId {
    return FormId.parse(attributeValue.S)
  }

  toDb(propertyValue: FormId, propertyMetadata?: PropertyMetadata<FormId>): StringAttribute | null {
    return { S: FormId.toString(propertyValue) }
  }
}

type AttributeStringOrListValue = StringAttribute | ListAttribute

export class FormIdsMapper implements MapperForType<FormId[] | FormId, AttributeStringOrListValue> {
  fromDb(attributeValue: AttributeStringOrListValue, propertyMetadata?: PropertyMetadata<FormId[]>): FormId[] | FormId {
    if ('L' in attributeValue) {
      return attributeValue.L.map(formIdDb => FormId.parse(formIdDb.S!))
    } else if ('S' in attributeValue) {
      return FormId.parse(attributeValue.S)
    } else {
      throw new Error('there is no mapping defined to read attributeValue ' + JSON.stringify(attributeValue))
    }
  }

  toDb(
    propertyValue: FormId[] | FormId,
    propertyMetadata?: PropertyMetadata<FormId[]>
  ): AttributeStringOrListValue | null {
    if (Array.isArray(propertyValue)) {
      return { L: propertyValue.map(a => ({ S: FormId.toString(a) })) }
    } else {
      return { S: FormId.toString(<FormId>propertyValue) }
    }
  }
}
