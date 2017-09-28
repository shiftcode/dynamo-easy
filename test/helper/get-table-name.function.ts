import { MetadataHelper } from '../../src/decorator/metadata/metadata-helper'
import { ModelConstructor } from '../../src/model/model-constructor'

export function getTableName<T>(modelClazz: ModelConstructor<T>): string {
  return MetadataHelper.get(modelClazz).modelOptions.tableName
}
