import 'reflect-metadata'

// these reflection keys are built in using the reflect-metadata library
export const KEY_TYPE = 'design:type'
export const KEY_PARAMETER = 'design:paramtypes'
export const KEY_RETURN_TYPE = 'design:returntype'

export const getMetadataType = makeMetadataGetter(KEY_TYPE)

export function makeMetadataGetter(metadataKey: string): (target: any, targetKey?: string) => any {
  return function(target: any, targetKey?: string) {
    return Reflect.getMetadata(metadataKey, target, targetKey)
  }
}

/**
 * Property index configuration
 */
// export interface IModelAttributeIndex {
//   name: string
//   unique?: boolean
//   isSecondaryKey?: boolean
//   sortKey?: string
// }

// export function Property(opts: AttributeOptions): PropertyDecorator {
//   return (target: Object, propertyKey: string | symbol) => {
//
//   };
// }
