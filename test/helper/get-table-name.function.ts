import { metadataForClass } from '../../src/decorator/metadata'
import { ModelConstructor } from '../../src/model/model-constructor'

export function getTableName<T>(modelClazz: ModelConstructor<T>): string {
  return metadataForClass(modelClazz).modelOptions.tableName
}
