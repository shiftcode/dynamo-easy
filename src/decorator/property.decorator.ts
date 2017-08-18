import { KeyType } from 'aws-sdk/clients/dynamodb'
import { Moment } from '../decorator/moment.type'
import { AttributeModelType } from '../mapper/attribute-model-type.type'
import { TypesByConvention, Util } from '../mapper/util'
import { ScDynamoObjectMapper } from '../sc-dynamo-object-mapper'
import { getMetadataType } from './decorators'
import { IndexType } from './index-type.enum'
import { PropertyData } from './property-data.model'
import { PropertyMetadata, TypeInfo } from './property-metadata.model'

export const KEY_PROPERTY = 'sc-reflect:property'

export type AttributeModelTypes = String | Number | Boolean | Date | Moment | Set<any> | any[]

export interface IndexData {
  name: string
  keyType: KeyType
}

export function Property(opts: Partial<PropertyData> = {}): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    const propertyOptions: Partial<PropertyMetadata<any>> = {
      name: propertyKey,
      nameDb: opts.name || propertyKey,
    }

    initOrUpdateProperty(propertyOptions, target, propertyKey)
  }
}

export function initOrUpdateIndex(indexType: IndexType, indexData: IndexData, target: any, propertyKey: string): void {
  const properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  const existingProperty: PropertyMetadata<any> = properties.find(property => property.name === propertyKey)

  let propertyMetadata: Partial<PropertyMetadata<any>>
  switch (indexType) {
    case IndexType.GSI:
      propertyMetadata = initOrUpdateGSI(
        existingProperty && existingProperty.keyForGSI ? existingProperty.keyForGSI : {},
        indexData
      )
      break
    case IndexType.LSI:
      propertyMetadata = initOrUpdateLSI(
        existingProperty && existingProperty.sortKeyForLSI ? existingProperty.sortKeyForLSI : [],
        indexData
      )
      break
  }

  initOrUpdateProperty(propertyMetadata, target, propertyKey)
}

function initOrUpdateGSI(indexes: { [key: string]: KeyType }, indexData: IndexData): Partial<PropertyMetadata<any>> {
  if (indexes[indexData.name]) {
    throw new Error(
      'the property with name is already registered as key for index - one property can only define one key per index'
    )
  } else {
    indexes[indexData.name] = indexData.keyType
  }

  return { keyForGSI: indexes }
}

function initOrUpdateLSI(indexes: string[], indexData: IndexData): Partial<PropertyMetadata<any>> {
  indexes.push(indexData.name)
  return { sortKeyForLSI: indexes }
}

export function initOrUpdateProperty(
  propertyMetadata: Partial<PropertyMetadata<any>> = {},
  target: any,
  propertyKey: string
): void {
  // Update the attribute array

  const properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  const existingProperty: PropertyMetadata<any> = properties.find(property => property.name === propertyKey)

  if (existingProperty) {
    // merge property options
    // console.log('merge into existing property', existingProperty, propertyMetadata);
    Object.assign<PropertyMetadata<any>, Partial<PropertyMetadata<any>>>(existingProperty, propertyMetadata)
  } else {
    // add new options
    const newProperty: PropertyMetadata<any> = createNewProperty(propertyMetadata, target, propertyKey)
    // console.log('new property', newProperty);
    properties.push(newProperty)
  }

  Reflect.defineMetadata(KEY_PROPERTY, properties, target.constructor)
}

function createNewProperty(
  propertyOptions: Partial<PropertyMetadata<any>> = {},
  target: any,
  propertyKey: string
): PropertyMetadata<any> {
  let propertyType: AttributeModelType = getMetadataType(target, propertyKey)
  let customType = isCustomType(propertyType)

  // FIXME model metadata is not accessible here, need to know the model data for metadatintorspection
  // let modelMetadata: ModelMetadata = Reflect.getMetadata(KEY_MODEL, target.constructor);
  const typeByConvention: TypesByConvention = Util.typeByConvention(propertyKey)
  if (typeByConvention) {
    customType = true

    if (ScDynamoObjectMapper.config) {
      switch (typeByConvention) {
        case 'date':
          switch (ScDynamoObjectMapper.config.dateType) {
            case 'default':
              propertyType = Date
              break
            case 'moment':
              propertyType = Moment
              break
            default:
              throw new Error(`Unsupported date type on model metadata <${ScDynamoObjectMapper.config.dateType}>`)
          }
          break
      }
    }
  }

  const propertyDescriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)

  const typeInfo: Partial<TypeInfo<any>> = <Partial<TypeInfo<any>>>{
    type: propertyType,
    isCustom: customType,
  }

  // console.log(`#### propertyKey: ${propertyKey} / typeInfo: ${JSON.stringify(typeInfo)}`);

  propertyOptions = {
      name: propertyKey,
      nameDb: propertyKey,
      typeInfo,
    ...propertyOptions
  }

  return <PropertyMetadata<any>>propertyOptions
}

/**
 * FIXME fix typing
 * FIXME make sure to implement the context dependant details of Binary (Buffer vs. Uint8Array)
 * @returns {boolean} true if the type cannot be mapped by dynamo document client
 */
function isCustomType(type: AttributeModelTypes): boolean {
  return (<any>type) !== String && (<any>type) !== Number && (<any>type) !== Boolean && (<any>type) !== Uint8Array
}
