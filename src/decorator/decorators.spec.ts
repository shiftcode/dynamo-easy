import { getMetaDataProperty } from '../../test/helper'
import {
  ComplexModel,
  CustomTableNameModel,
  DifferentModel,
  IdMapper,
  INDEX_ACTIVE,
  INDEX_ACTIVE_CREATED_AT,
  INDEX_COUNT,
  ModelWithABunchOfIndexes,
  ModelWithCustomMapperModel,
  ModelWithEnum,
  ModelWithEnumDeclared,
  ModelWithGSI,
  NestedObject,
  SimpleModel,
} from '../../test/models'
import { ExtendedFormModel, Form } from '../../test/models/real-world'
import { EnumType } from '../mapper'
import { Metadata, MetadataHelper, ModelMetadata } from './index'

describe('Decorators should add correct metadata', () => {
  describe('CustomMapper() should allow to define a different Mapper', () => {
    it('should define the mapper in metadata', () => {
      const metaData = MetadataHelper.forModel(ModelWithCustomMapperModel)

      expect(metaData).toBeDefined()
      expect(metaData.clazz).toBe(ModelWithCustomMapperModel)
      expect(metaData.properties).toBeDefined()

      const idMeta = getMetaDataProperty(metaData, 'id')

      expect(idMeta).toBeDefined()
      expect(idMeta!.name).toBe('id')
      expect(idMeta!.mapper).toBe(IdMapper)
    })
  })

  describe('for simple model', () => {
    let modelOptions: ModelMetadata<SimpleModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.forModel(SimpleModel)
    })

    it('with default table name', () => {
      expect(modelOptions).toBeDefined()
      expect(modelOptions.tableName).toBe('simple-models')
      expect(modelOptions.clazz).toBe(SimpleModel)
      expect(modelOptions.clazzName).toBe('SimpleModel')
    })

    it('with no properties', () => {
      expect(modelOptions.properties).toBeUndefined()
    })
  })

  describe('for custom table name', () => {
    let modelOptions: ModelMetadata<CustomTableNameModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.forModel(CustomTableNameModel)
    })

    it('with custom table name', () => {
      expect(modelOptions).toBeDefined()
      expect(modelOptions.tableName).toBe('myCustomName')
      expect(modelOptions.clazz).toBe(CustomTableNameModel)
      expect(modelOptions.clazzName).toBe('CustomTableNameModel')
    })
  })

  describe('for complex model', () => {
    let modelOptions: ModelMetadata<ComplexModel>

    beforeEach(() => {
      modelOptions = MetadataHelper.get(ComplexModel).modelOptions
    })

    it('with default model metadata', () => {
      expect(modelOptions.tableName).toBe('complex_model')
      expect(modelOptions.clazz).toBe(ComplexModel)
      expect(modelOptions.clazzName).toBe('ComplexModel')
    })

    it('with correct properties', () => {
      expect(modelOptions.properties).toBeDefined()
      expect(modelOptions.properties!.length).toBe(10)
    })

    it('with correct transient properties', () => {
      expect(modelOptions.transientProperties).toBeDefined()
      expect(modelOptions.transientProperties!.length).toBe(1)
    })

    describe('with correct property metdata', () => {
      it('ids', () => {
        const prop = getMetaDataProperty(modelOptions, 'id')
        expect(prop).toBeDefined()
        expect(prop!.name).toBe('id')
        expect(prop!.nameDb).toBe('id')
        expect(prop!.key).toBeDefined()
        expect(prop!.key!.type).toBe('HASH')
        expect(prop!.key!.uuid).toBeFalsy()
        expect(prop!.transient).toBeFalsy()
        expect(prop!.typeInfo).toBeDefined()
        expect(prop!.typeInfo!.isCustom).toBeFalsy()
        expect(prop!.typeInfo!.type).toBe(String)
      })

      it('creationDate', () => {
        const prop = getMetaDataProperty(modelOptions, 'creationDate')
        expect(prop).toBeDefined()
        expect(prop!.name).toBe('creationDate')
        expect(prop!.nameDb).toBe('creationDate')
        expect(prop!.key).toBeDefined()
        expect(prop!.key!.type).toBe('RANGE')
        expect(prop!.key!.uuid).toBeFalsy()
        expect(prop!.transient).toBeFalsy()
        expect(prop!.typeInfo).toBeDefined()
        expect(prop!.typeInfo!.isCustom).toBeTruthy()
      })

      it('active', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'active')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('active')
        expect(prop.nameDb).toBe('isActive')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeFalsy()
        expect(prop.typeInfo.type).toBe(Boolean)
      })

      it('set', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'set')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('set')
        expect(prop.nameDb).toBe('set')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)
      })

      it('sortedSet', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'sortedSet')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('sortedSet')
        expect(prop.nameDb).toBe('sortedSet')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.isSortedCollection).toBeTruthy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)
      })

      it('sortedComplexSet', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'sortedComplexSet')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('sortedComplexSet')
        expect(prop.nameDb).toBe('sortedComplexSet')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.isSortedCollection).toBeTruthy()

        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Set)

        expect(prop.typeInfo.genericType).toBeDefined()
        expect(prop.typeInfo.genericType).toBe(NestedObject)
      })

      it('mapWithNoType', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'mapWithNoType')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('mapWithNoType')
        expect(prop.nameDb).toBe('mapWithNoType')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(Map)
      })

      it('transientField', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'transientField')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('transientField')
        expect(prop.nameDb).toBe('transientField')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeTruthy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeFalsy()
        expect(prop.typeInfo.type).toBe(String)
      })

      it('simpleProperty', () => {
        const prop = getMetaDataProperty(modelOptions, 'simpleProperty')
        expect(prop).toBeUndefined()
      })

      it('nestedObject', () => {
        const prop: any = getMetaDataProperty(modelOptions, 'nestedObj')
        expect(prop).toBeDefined()
        expect(prop.name).toBe('nestedObj')
        expect(prop.nameDb).toBe('nestedObj')
        expect(prop.key).toBeUndefined()
        expect(prop.transient).toBeFalsy()
        expect(prop.typeInfo).toBeDefined()
        expect(prop.typeInfo.isCustom).toBeTruthy()
        expect(prop.typeInfo.type).toBe(NestedObject)
      })
    })
  })

  describe('indexes', () => {
    describe('simple index (partition key, no range key)', () => {
      let metadata: Metadata<ModelWithGSI>

      beforeEach(() => {
        metadata = MetadataHelper.get(ModelWithGSI)
      })

      it('should add indexes on model', () => {
        expect(metadata.modelOptions.indexes).toBeDefined()
        expect(metadata.modelOptions.indexes!.size).toBe(1)
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)).toBeDefined()
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)!.partitionKey).toBe('active')
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)!.sortKey).toBeUndefined()
      })

      it('should define the index on property metadata', () => {
        const propMeta: any = metadata.forProperty('active')
        expect(propMeta).toBeDefined()
        expect(propMeta.keyForGSI).toBeDefined()
        expect(Object.keys(propMeta.keyForGSI).length).toBe(1)
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBeDefined()
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBe('HASH')
      })
    })

    describe('index (partition key and range key)', () => {
      let metadata: Metadata<DifferentModel>

      beforeEach(() => {
        metadata = MetadataHelper.get(DifferentModel)
      })

      it('should add indexes on model', () => {
        expect(metadata.modelOptions.indexes).toBeDefined()
        expect(metadata.modelOptions.indexes!.size).toBe(1)
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)).toBeDefined()
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)!.partitionKey).toBe('active')
        expect(metadata.modelOptions.indexes!.get(INDEX_ACTIVE)!.sortKey).toBe('createdAt')
      })

      it('should define the index on property metadata', () => {
        const propMeta: any = metadata.forProperty('active')
        expect(propMeta).toBeDefined()
        expect(propMeta.keyForGSI).toBeDefined()
        expect(Object.keys(propMeta.keyForGSI).length).toBe(1)
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBeDefined()
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBe('HASH')
      })

      it('should define the index on property metadata', () => {
        const propMeta: any = metadata.forProperty('createdAt')
        expect(propMeta).toBeDefined()
        expect(propMeta.keyForGSI).toBeDefined()
        expect(Object.keys(propMeta.keyForGSI).length).toBe(1)
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBeDefined()
        expect(propMeta.keyForGSI[INDEX_ACTIVE]).toBe('RANGE')
      })
    })

    describe('index (a bunch of indexes with wild combinations)', () => {
      let metadata: Metadata<ModelWithABunchOfIndexes>

      beforeEach(() => {
        metadata = MetadataHelper.get(ModelWithABunchOfIndexes)
      })

      it('should add indexes on model', () => {
        expect(metadata.getPartitionKey()).toBeDefined()
        expect(metadata.getPartitionKey()).toBe('id')

        expect(metadata.getSortKey()).toBeDefined()
        expect(metadata.getSortKey()).toBe('createdAt')

        // metadata.getGlobalIndex(INDEX_ACTIVE_CREATED_AT)
        // metadata.getLocalIndex(INDEX_ACTIVE_CREATED_AT)

        expect(metadata.modelOptions.indexes).toBeDefined()
        expect(metadata.modelOptions.indexes!.size).toBe(2)

        const gsiActive = metadata.getIndex(INDEX_ACTIVE_CREATED_AT)
        expect(gsiActive).toBeDefined()
        expect(gsiActive!.partitionKey).toBe('active')
        expect(gsiActive!.sortKey).toBe('createdAt')

        const lsiCount = metadata.getIndex(INDEX_COUNT)
        expect(lsiCount).toBeDefined()
        expect(lsiCount!.partitionKey).toBe('myId')
        expect(lsiCount!.sortKey).toBe('count')
      })
    })
  })

  describe('enum (no Enum decorator)', () => {
    let metadata: Metadata<ModelWithEnum>

    beforeEach(() => {
      metadata = MetadataHelper.get(ModelWithEnum)
    })

    it('should add enum type to property', () => {
      const enumPropertyMetadata = metadata.forProperty('type')!
      expect(enumPropertyMetadata.typeInfo).toBeDefined()
      expect(enumPropertyMetadata.typeInfo).toEqual({ type: Object, isCustom: true })
    })
  })

  describe('enum', () => {
    let metadata: Metadata<ModelWithEnumDeclared>

    beforeEach(() => {
      metadata = MetadataHelper.get(ModelWithEnumDeclared)
    })

    it('should add enum type to property', () => {
      const enumPropertyMetadata = metadata.forProperty('type')!
      expect(enumPropertyMetadata.typeInfo).toBeDefined()
      expect(enumPropertyMetadata.typeInfo).toEqual({ type: EnumType, isCustom: true })
    })
  })

  // FIXME TEST make this work
  xdescribe('models inheritance', () => {
    let metadata: Metadata<Form>

    beforeEach(() => {
      metadata = MetadataHelper.get(Form)
    })

    it('model metadata should be defined', () => {
      const meta = metadata.forProperty('id')
      expect(metadata.modelOptions.properties!.length).toBe(4)
      expect(meta).toBeDefined()
    })
  })

  // FIXME TEST make this work
  xdescribe('models inheritance', () => {
    let metadata: Metadata<ExtendedFormModel>

    beforeEach(() => {
      metadata = MetadataHelper.get(Form)
    })

    it('model metadata schould be defined', () => {
      expect(metadata).toBeDefined()
      expect(metadata.modelOptions.properties!.length).toBe(2)
    })
  })
})
