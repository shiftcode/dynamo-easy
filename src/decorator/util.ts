/**
 * @module decorators
 */
// these reflection keys are built in using the reflect-metadata library
import { ModelConstructor } from '../model/model-constructor'

/**
 * @hidden
 */
export const KEY_TYPE = 'design:type'

/**
 * @hidden
 */
export const KEY_PARAMETER = 'design:paramtypes'

/**
 * @hidden
 */
export const KEY_RETURN_TYPE = 'design:returntype'

/**
 * @hidden
 */
export const getMetadataType = makeMetadataGetter<ModelConstructor<any>>(KEY_TYPE)

/**
 * @hidden
 */
export function makeMetadataGetter<T>(metadataKey: string): (target: any, targetKey: string) => T {
  return (target: any, targetKey: string) => Reflect.getMetadata(metadataKey, target, targetKey)
}
