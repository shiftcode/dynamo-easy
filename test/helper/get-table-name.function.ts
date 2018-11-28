import { metadataForClass, ModelConstructor } from '../../src/dynamo-easy'

export function getTableName<T>(modelClazz: ModelConstructor<T>): string {
  return metadataForClass(modelClazz).modelOptions.tableName
}
