import { ModelConstructor } from '../../model'
import { createKeyAttributes } from '../create-ket-attributes.function'
import { WriteOperation } from './write-operation'
import { DeleteOperationParams } from './write-operation-params.type'

export class DeleteOperation<T> extends WriteOperation<T, DeleteOperationParams<T>, DeleteOperation<T>> {
  constructor(modelClazz: ModelConstructor<T>, partitionKey: any, sortKey?: any) {
    super(modelClazz)
    this.params.Key = createKeyAttributes(this.metadata, partitionKey, sortKey)
  }
}
