import { hasSortKey } from '../../decorator/metadata/metadata'
import { Attribute, Attributes, toDbOne } from '../../mapper'
import { ModelConstructor } from '../../model'
import { WriteOperation } from './write-operation'
import { DeleteOperationParams } from './write-operation-params.type'

export class DeleteOperation<T> extends WriteOperation<T, DeleteOperationParams<T>, DeleteOperation<T>> {

  constructor(
    modelClazz: ModelConstructor<T>,
    partitionKey: any,
    sortKey?: any,
  ) {
    super(modelClazz)

    const partitionKeyProp = this.metadata.getPartitionKey()

    const keyAttributeMap = <Attributes<Partial<T>>>{
      [partitionKeyProp]: toDbOne(partitionKey, this.metadata.forProperty(partitionKeyProp)),
    }

    if (hasSortKey(this.metadata)) {
      if (sortKey === null || sortKey === undefined) {
        throw new Error(`please provide the sort key for attribute ${this.metadata.getSortKey()}`)
      }
      const sortKeyProp = this.metadata.getSortKey()
      keyAttributeMap[sortKeyProp] = <Attribute>toDbOne(sortKey, this.metadata.forProperty(sortKeyProp))
    }

    this.params.Key = keyAttributeMap

  }

}
