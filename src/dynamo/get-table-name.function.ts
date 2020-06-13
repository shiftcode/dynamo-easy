/**
 * @module dynamo-easy
 */
import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { Metadata } from '../decorator/metadata/metadata'
import { metadataForModel } from '../decorator/metadata/metadata-for-model.function'
import { ModelConstructor } from '../model/model-constructor'

/**
 * only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long
 * http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-naming-rules
 *
 * @hidden
 */
const REGEX_TABLE_NAME = /^[a-zA-Z0-9_\-.]{3,255}$/

/**
 * @hidden
 */
export function getTableName(metaDataOrModelClazz: Metadata<any> | ModelConstructor<any>): string {
  const modelOptions =
    metaDataOrModelClazz instanceof Metadata
      ? metaDataOrModelClazz.modelOptions
      : metadataForModel(metaDataOrModelClazz).modelOptions

  const tableName = dynamoEasyConfig.tableNameResolver(modelOptions.tableName)

  if (!REGEX_TABLE_NAME.test(tableName)) {
    throw new Error(
      `make sure the table name «${tableName}» is valid (see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-naming-rules for details)`,
    )
  }
  return tableName
}
