import { ModelMetadata, PropertyMetadata } from '../../src/dynamo-easy'

export function getMetaDataProperty<T, K extends keyof T>(
  modelOptions: ModelMetadata<T>,
  propertyKey: K,
): PropertyMetadata<T[K]> | undefined {
  return <any>modelOptions.properties.find((property) => property.name === propertyKey)
}
