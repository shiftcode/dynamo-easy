import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { Metadata, metadataForClass } from '../decorator/metadata'
import { ModelConstructor } from '../model'

/*
 * only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long
 * http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-naming-rules
 */
const REGEX_TABLE_NAME = /^[a-zA-Z0-9_\-.]{3,255}$/

export function getTableName(metaDataOrModelClazz: Metadata<any> | ModelConstructor<any>): string {
  const modelOptions =
    metaDataOrModelClazz instanceof Metadata
      ? metaDataOrModelClazz.modelOptions
      : metadataForClass(metaDataOrModelClazz).modelOptions

  const tableName = dynamoEasyConfig.tableNameResolver(modelOptions.tableName)

  if (!REGEX_TABLE_NAME.test(tableName)) {
    throw new Error(
      `make sure the table name «${tableName}» is valid (see http://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Limits.html#limits-naming-rules for details)`,
    )
  }
  return tableName
}
