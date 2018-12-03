// todo: remove the other tests for this functionality (in the spec files form classes now using this createAttrFun)

import { SimpleWithCompositePartitionKeyModel, SimpleWithPartitionKeyModel } from '../../test/models'
import { metadataForClass } from '../decorator/metadata'
import { createKeyAttributes } from './create-ket-attributes.function'

describe('createKeyAttribute', () => {
  it('PartitionKey only', () => {
    const attrs = createKeyAttributes(metadataForClass(SimpleWithPartitionKeyModel), 'myId')
    expect(attrs).toEqual({
      id: { S: 'myId' },
    })
  })

  it('PartitionKey + SortKey', () => {
    const now = new Date()
    const attrs = createKeyAttributes(metadataForClass(SimpleWithCompositePartitionKeyModel), 'myId', now)
    expect(attrs).toEqual({
      id: { S: 'myId' },
      creationDate: { S: now.toISOString() },
    })
  })

  it('should throw when required sortKey is missing', () => {
    expect(() => createKeyAttributes(metadataForClass(SimpleWithCompositePartitionKeyModel), 'myId')).toThrow()
  })
})
