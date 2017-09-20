import { ComplexModel } from '../../../test/models/complex.model'
import { PartitionKey } from '../../decorator/impl/key/partition-key.decorator'
import { Model } from '../../decorator/impl/model/model.decorator'
import { Property } from '../../decorator/impl/property/property.decorator'
import { MetadataHelper } from '../../decorator/metadata/metadata-helper'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { ModelConstructor } from '../../model/model-constructor'
import { and } from './logical-operator/and'
import { not } from './logical-operator/not'
import { or } from './logical-operator/or'
import { property } from './logical-operator/property'

@Model()
class MyModel {
  @PartitionKey() id: string

  @Property({ name: 'propDb' })
  prop: number
}

describe('expressions', () => {
  it('use property metadata', () => {
    const condition = property<MyModel>('prop').gt(10)(undefined, MetadataHelper.get(MyModel))
    expect(condition.statement).toBe('#prop > :prop')

    expect(condition.attributeNames['#prop']).toBeDefined()
    expect(condition.attributeNames['#prop']).toBe('propDb')

    expect(condition.attributeValues[':prop']).toBeDefined()
    expect(condition.attributeValues[':prop']).toEqual({ N: '10' })
  })

  it('simple', () => {
    const condition = property('age').gt(10)(undefined, undefined)
    expect(condition.statement).toBe('#age > :age')
  })

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
