import { hasSortKey, Metadata } from '../decorator/metadata/metadata'
import { Attribute, Attributes, toDbOne } from '../mapper/index'

export function createKeyAttributes<T>(metadata: Metadata<T>, partitionKey: any, sortKey?: any): Attributes<Partial<T>> {
  const partitionKeyProp = metadata.getPartitionKey()

  const keyAttributeMap = <Attributes<T>>{
    [partitionKeyProp]: toDbOne(partitionKey, metadata.forProperty(partitionKeyProp)),
  }

  if (hasSortKey(metadata)) {
    if (sortKey === null || sortKey === undefined) {
      throw new Error(`please provide the sort key for attribute ${metadata.getSortKey()}`)
    }
    const sortKeyProp = metadata.getSortKey()
    keyAttributeMap[sortKeyProp] = <Attribute>toDbOne(sortKey, metadata.forProperty(sortKeyProp))
  }

  return keyAttributeMap
}
