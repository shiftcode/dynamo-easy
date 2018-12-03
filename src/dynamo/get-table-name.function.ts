import { dynamoEasyConfig } from '../config/dynamo-easy-config'
import { Metadata, metadataForClass } from '../decorator/metadata'
import { ModelConstructor } from '../model'
import { REGEX_TABLE_NAME } from './request/regex'


export function getTableName(metaDataOrModelClazz: Metadata<any> | ModelConstructor<any>): string {
  const modelOptions = metaDataOrModelClazz instanceof Metadata
    ? metaDataOrModelClazz.modelOptions
    : metadataForClass(metaDataOrModelClazz).modelOptions

  const tableName = dynamoEasyConfig.tableNameResolver(modelOptions.tableName)

  if (!REGEX_TABLE_NAME.test(tableName)) {
    throw new Error(
      'make sure the table name only contains these characters «a-z A-Z 0-9 - _ .» and is between 3 and 255 characters long',
    )
  }
  return tableName
}
