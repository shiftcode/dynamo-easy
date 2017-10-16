import { Organization } from '../../../../test/models/organization.model'
import { BatchGetRequest } from './batch-get.request'

describe('batch get', () => {
  let request: BatchGetRequest

  beforeEach(() => {
    request = new BatchGetRequest()
  })

  it('base params', () => {
    const params = request.params
    expect(params).toEqual({ RequestItems: {} })
  })

  it('key', () => {
    request.forModel(Organization, ['idValue'])
    const params = request.params
    expect(params.RequestItems).toBeDefined()
    expect(params.RequestItems['Organization']).toBeDefined()
    expect(params.RequestItems['Organization']).toEqual({ Keys: [{ id: { S: 'idValue' } }] })
  })
})
