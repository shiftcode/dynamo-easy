// tslint:disable:max-classes-per-file
// tslint:disable:no-non-null-assertion
import { Model } from '..'
import { FormId, formIdMapper } from '../../../../test/models/real-world'
import { metadataForClass, metadataForProperty } from '../../metadata'
import { CollectionProperty } from './collection-property.decorator'

describe('@CollectionProperty', () => {
  it('name', () => {
    @Model()
    class Test {
      @CollectionProperty({ name: 'my_collection' })
      myCollection: Set<FormId>
    }

    const meta = metadataForProperty(Test, 'myCollection')
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

    const meta = metadataForProperty(Test, 'myCollection')
    expect(meta).toBeDefined()
    expect(meta!.isSortedCollection).toBeTruthy()
  })

  it('itemMapper', () => {
    @Model()
    class Test {
      @CollectionProperty({ itemMapper: formIdMapper })
      myCollection: Set<FormId>
    }

    const meta = metadataForProperty(Test, 'myCollection')
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

    const meta = metadataForProperty(Test, 'myCollection')
    expect(meta).toBeDefined()
    expect(meta!.typeInfo).toBeDefined()
    expect(meta!.typeInfo!.genericType).toBe(FormId)
  })

  it('thows when not on an array or set', () => {
    expect(() => {
      @Model()
      class Test {
        @CollectionProperty()
        myCollection: FormId
      }

      metadataForClass(Test)
    }).toThrow()
  })

  it('thows when not both itemMapper and itemType are set', () => {
    expect(() => {
      @Model()
      class Test {
        @CollectionProperty({
          itemMapper: formIdMapper,
          itemType: FormId,
        })
        myCollection: Set<FormId>
      }

      metadataForClass(Test)
    }).toThrow()
  })
})
