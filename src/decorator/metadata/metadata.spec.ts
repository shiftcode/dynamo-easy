// tslint:disable:no-non-null-assertion
import {
  ComplexModel,
  FAIL_MODEL_GSI,
  INDEX_ACTIVE,
  INDEX_ACTIVE_CREATED_AT,
  INDEX_COUNT,
  ModelWithABunchOfIndexes,
  ModelWithDefaultValue,
  ModelWithGSI,
  ModelWithLSI,
  ModelWithoutPartitionKeyModel,
  SimpleWithCompositePartitionKeyModel,
  SimpleWithPartitionKeyModel,
} from '../../../test/models'
import { Metadata } from './metadata'

describe('metadata', () => {
  let metaDataPartitionKey: Metadata<SimpleWithPartitionKeyModel>
  let metaDataNoPartitionKey: Metadata<ModelWithoutPartitionKeyModel>
  let metaDataComposite: Metadata<SimpleWithCompositePartitionKeyModel>
  let metaDataLsi: Metadata<ModelWithLSI>
  let metaDataGsi: Metadata<ModelWithGSI>
  let metaDataIndexes: Metadata<ModelWithABunchOfIndexes>
  let metaDataDefaultValue: Metadata<ModelWithDefaultValue>
  let metaDataComplex: Metadata<ComplexModel>

  beforeEach(() => {
    metaDataPartitionKey = new Metadata(SimpleWithPartitionKeyModel)
    metaDataNoPartitionKey = new Metadata(ModelWithoutPartitionKeyModel)
    metaDataComposite = new Metadata(SimpleWithCompositePartitionKeyModel)
    metaDataLsi = new Metadata(ModelWithLSI)
    metaDataGsi = new Metadata(ModelWithGSI)
    metaDataIndexes = new Metadata(ModelWithABunchOfIndexes)
    metaDataDefaultValue = new Metadata(ModelWithDefaultValue)
    metaDataComplex = new Metadata(ComplexModel)
  })

  it('forProperty', () => {
    const forId = metaDataPartitionKey.forProperty('id')
    expect(forId).toBeDefined()
    expect(forId!.key).toBeDefined()
    expect(forId!.name).toBe('id')
    expect(forId!.typeInfo).toBeDefined()
  })

  it('forProperty [nested object]', () => {
    const nestedObjDateMeta = metaDataComplex.forProperty('nestedObj.date')
    expect(nestedObjDateMeta).toBeDefined()
    expect(nestedObjDateMeta!.name).toEqual('date')
  })

  it('forProperty [property of nested object in list]', () => {
    const nestedObjDateMeta = metaDataComplex.forProperty('sortedComplexSet[0].date')
    expect(nestedObjDateMeta).toBeDefined()
    expect(nestedObjDateMeta!.name).toEqual('date')
  })

  it('forProperty without decorator [nested object in list]', () => {
    const nestedObjDateMeta = metaDataComplex.forProperty('sortedComplexSet[0].id')
    expect(nestedObjDateMeta).toBeUndefined()
  })

  it('getPropertiesWithDefaultValueProvider', () => {
    const props = metaDataDefaultValue.getPropertiesWithDefaultValueProvider()
    expect(props.length).toBe(1)
    expect(props[0].key).toBeDefined()
    expect(props[0].name).toBe('id')
    expect(props[0].defaultValueProvider).toBeDefined()
    expect(props[0].defaultValueProvider!()).toBeDefined()
  })

  it('getPartitionKey', () => {
    expect(metaDataPartitionKey.getPartitionKey()).toEqual('id')
    expect(metaDataGsi.getPartitionKey(INDEX_ACTIVE)).toEqual('active')
    expect(metaDataIndexes.getPartitionKey(INDEX_COUNT)).toEqual('myId')
    expect(metaDataIndexes.getPartitionKey(INDEX_ACTIVE_CREATED_AT)).toEqual('active')
  })

  it('getPartitionKey throws if no partitionKey defined [no index]', () => {
    expect(() => metaDataNoPartitionKey.getPartitionKey()).toThrow()
  })
  it('getPartitionKey throws if no partitionKey defined [GSI]', () => {
    expect(() => metaDataNoPartitionKey.getPartitionKey(FAIL_MODEL_GSI)).toThrow()
  })
  it('getPartitionKey throws if given index is not defined', () => {
    expect(() => metaDataNoPartitionKey.getPartitionKey('not-existing-index')).toThrow()
  })

  it('getSortKey', () => {
    expect(metaDataPartitionKey.getSortKey()).toBe(null)
    expect(metaDataComposite.getSortKey()).toBe('creationDate')
    expect(metaDataLsi.getSortKey(INDEX_ACTIVE)).toBe('active')
    expect(() => metaDataGsi.getSortKey(INDEX_ACTIVE)).toThrow()
    expect(metaDataIndexes.getSortKey(INDEX_ACTIVE_CREATED_AT)).toBe('createdAt')
  })
  it('getSortKey throws if given index is not defined', () => {
    expect(() => metaDataNoPartitionKey.getSortKey('non-existent-index-name')).toThrow()
  })

  it('getIndexes', () => {
    expect(metaDataLsi.getIndexes()).toEqual([{ partitionKey: 'id', sortKey: 'active' }])
    expect(metaDataGsi.getIndexes()).toEqual([{ partitionKey: 'active' }])
    expect(metaDataIndexes.getIndexes()).toEqual([
      { partitionKey: 'active', sortKey: 'createdAt' },
      { partitionKey: 'myId', sortKey: 'count' },
    ])
  })

  it('getIndex', () => {
    expect(metaDataPartitionKey.getIndexes().length).toBe(0)
    expect(metaDataPartitionKey.getIndex('blub')).toBe(null)
    expect(metaDataIndexes.getIndex(INDEX_ACTIVE_CREATED_AT)).toEqual({
      partitionKey: 'active',
      sortKey: 'createdAt',
    })
  })
  it('getIndex returns null if not existent', () => {
    // no indexes at all --> should always be defined
    expect(metaDataNoPartitionKey.modelOptions).toBeDefined()
    expect(metaDataNoPartitionKey.modelOptions.indexes).toBeInstanceOf(Map)
    // no indexes at all
    expect(metaDataPartitionKey.getIndex('non-existent-index')).toBeNull()
    // indexes defined, but not the one requesting
    expect(metaDataIndexes.getIndex('non-existent-index')).toBeNull()
  })
})
