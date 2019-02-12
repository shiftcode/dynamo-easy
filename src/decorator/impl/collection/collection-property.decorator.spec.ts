// tslint:disable:max-classes-per-file
// tslint:disable:no-non-null-assertion
import { FormId, formIdMapper } from '../../../../test/models/real-world'
import { metadataForModel } from '../../metadata/metadata-for-model.function'
import { Model } from '../model/model.decorator'
import { CollectionProperty } from './collection-property.decorator'

describe('@CollectionProperty', () => {
  it('name', () => {
    @Model()
    class Test {
      @CollectionProperty({ name: 'my_collection' })
      myCollection: Set<FormId>
    }

    const meta = metadataForModel(Test).forProperty('myCollection')
    expect(meta).toBeDefined()
    expect(meta!.name).toBe('myCollection')
    expect(meta!.nameDb).toBe('my_collection')
  })

  it('sorted', () => {
    @Model()
    class Test {
      @CollectionProperty({ sorted: true })
      myCollection: Set<FormId>
    }

    const meta = metadataForModel(Test).forProperty('myCollection')
    expect(meta).toBeDefined()
    expect(meta!.isSortedCollection).toBeTruthy()
  })

  it('itemMapper', () => {
    @Model()
    class Test {
      @CollectionProperty({ itemMapper: formIdMapper })
      myCollection: Set<FormId>
    }

    const meta = metadataForModel(Test).forProperty('myCollection')
    expect(meta).toBeDefined()
    expect(meta!.mapper).toBeDefined()
    expect(typeof meta!.mapperForSingleItem === 'function').toBeTruthy()
    expect(meta!.mapperForSingleItem!()).toBe(formIdMapper)
  })

  it('itemType', () => {
    @Model()
    class Test {
      @CollectionProperty({ itemType: FormId })
      myCollection: FormId[]
    }

    const meta = metadataForModel(Test).forProperty('myCollection')
    expect(meta).toBeDefined()
    expect(meta!.typeInfo).toBeDefined()
    expect(meta!.typeInfo!.genericType).toBe(FormId)
  })

  it('throws when not on an array or set', () => {
    expect(() => {
      @Model()
      class Test {
        @CollectionProperty()
        myCollection: FormId
      }

      metadataForModel(Test)
    }).toThrow()
  })

  it('throws when not both itemMapper and itemType are set', () => {
    expect(() => {
      @Model()
      class Test {
        @CollectionProperty({
          itemMapper: formIdMapper,
          itemType: FormId,
        })
        myCollection: Set<FormId>
      }

      metadataForModel(Test)
    }).toThrow()
  })
})
