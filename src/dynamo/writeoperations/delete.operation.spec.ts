import { ComplexModel, SimpleWithPartitionKeyModel } from '../../../test/models'
import { DeleteOperation } from './delete.operation'

describe('delete operation', () => {
  it('should create request with key (simple) expression', () => {
    const delOp = new DeleteOperation(SimpleWithPartitionKeyModel, 'myId')
    const key = delOp.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(1)

    expect(key.id).toBeDefined()
    expect(key.id).toEqual({ S: 'myId' })
  })

  it('should create request with key (composite) expression', () => {
    const now = new Date()
    const delOp = new DeleteOperation(ComplexModel, 'partitionValue', now)
    const key = delOp.params.Key
    expect(key).toBeDefined()
    expect(Object.keys(key).length).toBe(2)

    expect(key.id).toBeDefined()
    expect(key.id).toEqual({ S: 'partitionValue' })
    expect(key.creationDate).toBeDefined()
    expect(key.creationDate).toEqual({
      S: now.toISOString(),
    })
  })

  it('should throw for no sort key value', () => {
    expect(() => new DeleteOperation(ComplexModel, 'partitionValue')).toThrowError()
  })
})
