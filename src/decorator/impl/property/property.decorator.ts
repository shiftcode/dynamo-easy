import { KeyType } from 'aws-sdk/clients/dynamodb'
import { DynamoEasy } from '../../../dynamo-easy'
import { AttributeModelType } from '../../../mapper/type/attribute-model.type'
import { Util } from '../../../mapper/util'
import { PropertyMetadata, TypeInfo } from '../../metadata/property-metadata.model'
import { getMetadataType } from '../../util'
import { MomentType } from '../date/moment.type'
import { IndexType } from '../index/index-type.enum'
import { PropertyData } from './property-data.model'

export const KEY_PROPERTY = 'sc-reflect:property'

export type AttributeModelTypes = string | number | boolean | Date | MomentType | Set<any> | any[]

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
  const existingProperty = properties.find(property => property.name === propertyKey)

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
    default:
      throw new Error(`unsupported index type ${indexType}`)
  }

  initOrUpdateProperty(propertyMetadata, target, propertyKey)
}

function initOrUpdateGSI(indexes: { [key: string]: KeyType }, indexData: IndexData): Partial<PropertyMetadata<any>> {
  if (indexes[indexData.name]) {
    // TODO LOW:INVESTIGATE when we throw an error we have a problem where multiple different classes extend one base class, this will be executed by multiple times
    // throw new Error(
    //   'the property with name is already registered as key for index - one property can only define one key per index'
    // )
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
  const existingProperty = properties.find(property => property.name === propertyKey)

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

  const typeByConvention = Util.typeByConvention(propertyKey)
  if (typeByConvention) {
    customType = true

    if (DynamoEasy.config) {
      switch (typeByConvention) {
        case 'date':
          switch (DynamoEasy.config.dateType) {
            case 'default':
              propertyType = Date
              break
            case 'moment':
              propertyType = MomentType
              break
            default:
              throw new Error(`Unsupported date type on model metadata <${DynamoEasy.config.dateType}>`)
          }
          break
      }
    }
  }

  const propertyDescriptor: PropertyDescriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)

  const typeInfo: Partial<TypeInfo> = <Partial<TypeInfo>>{
    type: propertyType,
    isCustom: customType,
  }

  // console.log(`#### propertyKey: ${propertyKey} / typeInfo: ${JSON.stringify(typeInfo)}`);

  propertyOptions = {
    name: propertyKey,
    nameDb: propertyKey,
    typeInfo,
    ...propertyOptions,
  }

  return <PropertyMetadata<any>>propertyOptions
}

/**
 * TODO LOW:BINARY make sure to implement the context dependant details of Binary (Buffer vs. Uint8Array)
 * @returns {boolean} true if the type cannot be mapped by dynamo document client
 */
function isCustomType(type: AttributeModelTypes): boolean {
  return <any>type !== String && <any>type !== Number && <any>type !== Boolean && <any>type !== Uint8Array
}
