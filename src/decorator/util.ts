// these reflection keys are built in using the reflect-metadata library
import { ModelConstructor } from '../model/model-constructor'

export const KEY_TYPE = 'design:type'
export const KEY_PARAMETER = 'design:paramtypes'
export const KEY_RETURN_TYPE = 'design:returntype'

export const getMetadataType = makeMetadataGetter<ModelConstructor<any>>(KEY_TYPE)

export function makeMetadataGetter<T>(metadataKey: string): (target: any, targetKey?: string) => T {
  return (target: any, targetKey?: string) => {
    if (targetKey) {
      return Reflect.getMetadata(metadataKey, target, targetKey)
    } else {
      return Reflect.getMetadata(metadataKey, target)
    }
  }
}
