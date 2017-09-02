// these reflection keys are built in using the reflect-metadata library
export const KEY_TYPE = 'design:type'
export const KEY_PARAMETER = 'design:paramtypes'
export const KEY_RETURN_TYPE = 'design:returntype'

export const getMetadataType = makeMetadataGetter(KEY_TYPE)

export function makeMetadataGetter(metadataKey: string): (target: any, targetKey?: string) => any {
  return (target: any, targetKey?: string) => {
    if (targetKey) {
      return Reflect.getMetadata(metadataKey, target, targetKey)
    } else {
      return Reflect.getMetadata(metadataKey, target)
    }
  }
}
