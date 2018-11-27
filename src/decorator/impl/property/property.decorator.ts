import { KeyType } from 'aws-sdk/clients/dynamodb'
import { AttributeValueType } from '../../../mapper/type/attribute-value-type.type'
import { Attribute } from '../../../mapper/type/attribute.type'
import { ModelConstructor } from '../../../model'
import { PropertyMetadata, TypeInfo } from '../../metadata/property-metadata.model'
import { getMetadataType } from '../../util'
import { IndexType } from '../index/index-type.enum'
import { PropertyData } from './property-data.model'

export const KEY_PROPERTY = 'sc-reflect:property'

export interface IndexData {
  name: string
  keyType: KeyType
}

export function Property(opts: Partial<PropertyData> = {}): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (typeof propertyKey === 'string') {
      const propertyOptions: Partial<PropertyMetadata<any>> = {
        name: propertyKey,
        nameDb: opts.name || propertyKey,
      }

      initOrUpdateProperty(propertyOptions, target, propertyKey)
    }
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
        indexData,
      )
      break
    case IndexType.LSI:
      propertyMetadata = initOrUpdateLSI(
        existingProperty && existingProperty.sortKeyForLSI ? existingProperty.sortKeyForLSI : [],
        indexData,
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
  propertyMetadata: Partial<PropertyMetadata<any, Attribute>> = {},
  target: any,
  propertyKey: string,
): void {
  // the new or updated property
  let property: PropertyMetadata<any>

  // Update the attribute array
  let properties: Array<PropertyMetadata<any>> = Reflect.getMetadata(KEY_PROPERTY, target.constructor) || []
  const existingProperty = properties.find(p => p.name === propertyKey)
  if (existingProperty) {
    // create new property with merged options
    property = { ...existingProperty, ...propertyMetadata }
    // remove existing from array
    properties = properties.filter(p => p !== existingProperty)
  } else {
    // add new options
    property = createNewProperty(propertyMetadata, target, propertyKey)
  }

  Reflect.defineMetadata(KEY_PROPERTY, [...properties, property], target.constructor)
}

function createNewProperty(
  propertyOptions: Partial<PropertyMetadata<any, Attribute>> = {},
  target: any,
  propertyKey: string,
): PropertyMetadata<any> {
  const propertyType: ModelConstructor<any> = getMetadataType(target, propertyKey)
  const customType = isCustomType(propertyType)

  const typeInfo: TypeInfo = {
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
function isCustomType(type: AttributeValueType): boolean {
  return <any>type !== String && <any>type !== Number && <any>type !== Boolean && <any>type !== Uint8Array
}
