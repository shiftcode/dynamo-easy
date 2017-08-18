import { KeyType } from 'aws-sdk/clients/dynamodb'
import { Util } from '../mapper/util'
import { ModelConstructor } from '../model/model-constructor'
import { IndexType } from './index-type.enum'
import { TypeInfo } from './property-metadata.model'
import { initOrUpdateIndex, initOrUpdateProperty } from './property.decorator'

/**
 * Marks a property as the sort key attribute of a local secondary index (the partition key must be same as in base table)
 *
 * @param {string} indexName Name of the local secondary index
 * @returns {PropertyDecorator}
 */
export function LSISortKey(indexName: string): PropertyDecorator {
  return (target: any, propertyKey: string) => {
    initOrUpdateIndex(IndexType.LSI, { name: indexName, keyType: 'RANGE' }, target, propertyKey)
  }
}
