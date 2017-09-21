import { PartitionKey } from '../../../decorator/impl/key/partition-key.decorator'
import { Model } from '../../../decorator/impl/model/model.decorator'
import { Property } from '../../../decorator/impl/property/property.decorator'
import { MetadataHelper } from '../../../decorator/metadata/metadata-helper'
import { and } from './and.function'
import { not } from './not.function'
import { or } from './or.function'
import { property } from './property.function'

describe('chained conditions', () => {
  it('not', () => {
    const condition = not(property('name').contains('Bla')(undefined, undefined))
    expect(condition.statement).toBe('NOT contains (#name, :name)')
  })

  it('and & not', () => {
    const condition = and(
      not(property('name').contains('z')(undefined, undefined)),
      property('name').beginsWith('Sta')(undefined, undefined)
    )

    expect(condition.attributeNames).toBeDefined()
    expect(Object.keys(condition.attributeNames).length).toBe(1)

    expect(condition.attributeValues).toBeDefined()
    expect(Object.keys(condition.attributeValues).length).toBe(2)
    expect(condition.attributeValues[':name']).toEqual({ S: 'z' })
    expect(condition.attributeValues[':name_2']).toEqual({ S: 'Sta' })

    expect(condition.statement).toBe('(NOT contains (#name, :name) AND begins_with (#name, :name_2))')
  })

  it('or', () => {
    const condition = or(
      property('age').gt(10)(undefined, undefined),
      property('name').contains('Bla')(undefined, undefined)
    )

    expect(condition.statement).toBe('(#age > :age OR contains (#name, :name))')
  })

  it('and', () => {
    const condition = and(
      property('age').gt(10)(undefined, undefined),
      property('name').contains('Bla')(undefined, undefined)
    )

    expect(condition.statement).toBe('(#age > :age AND contains (#name, :name))')
  })

  it('mixed', () => {
    const condition = or(
      and(property('age').gt(10)(undefined, undefined), property('name').contains('Bla')(undefined, undefined)),
      property('bla').beginsWith('Start')(undefined, undefined)
    )

    expect(condition.statement).toBe('((#age > :age AND contains (#name, :name)) OR begins_with (#bla, :bla))')
  })
})
