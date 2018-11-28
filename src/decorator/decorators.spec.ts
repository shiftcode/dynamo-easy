// tslint:disable:max-classes-per-file
// tslint:disable:no-unnecessary-class
// tslint:disable:no-non-null-assertion
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
import { Form } from '../../test/models/real-world'
import { EnumType } from '../mapper'
import { GSIPartitionKey, GSISortKey, LSISortKey, PartitionKey, Property, SortedSet, SortKey, Transient } from './impl'
import { Model } from './impl/model/model.decorator'
import { Metadata, metadataForClass, metadataForModel, ModelMetadata } from './index'
import { metadataForProperty } from './metadata'

describe('Decorators should add correct metadata', () => {
  describe('CustomMapper() should allow to define a different Mapper', () => {
    it('should define the mapper in metadata', () => {
      const metaData = metadataForModel(ModelWithCustomMapperModel)

      expect(metaData).toBeDefined()
      expect(metaData.clazz).toBe(ModelWithCustomMapperModel)
      expect(metaData.properties).toBeDefined()

      const idMeta = getMetaDataProperty(metaData, 'id')

      expect(idMeta).toBeDefined()
      expect(idMeta!.name).toBe('id')
      expect(idMeta!.mapper).toBeDefined()
      expect(idMeta!.mapper!()).toBe(IdMapper)
    })
  })

  describe('for simple model', () => {
    let modelOptions: ModelMetadata<SimpleModel>

    beforeEach(() => {
      modelOptions = metadataForModel(SimpleModel)
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
      modelOptions = metadataForModel(CustomTableNameModel)
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
      modelOptions = metadataForClass(ComplexModel).modelOptions
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
        metadata = metadataForClass(ModelWithGSI)
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
        metadata = metadataForClass(DifferentModel)
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
        metadata = metadataForClass(ModelWithABunchOfIndexes)
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
      metadata = metadataForClass(ModelWithEnum)
    })

    it('should add enum type to property', () => {
      const enumPropertyMetadata = metadata.forProperty('type')!
      expect(enumPropertyMetadata.typeInfo).toBeDefined()
      expect(enumPropertyMetadata.typeInfo).toEqual({ type: Number, isCustom: false })

      const strEnumPropertyMetadata = metadata.forProperty('strType')!
      expect(strEnumPropertyMetadata.typeInfo).toBeDefined()
      expect(strEnumPropertyMetadata.typeInfo).toEqual({ type: String, isCustom: false })
    })
  })

  describe('enum', () => {
    let metadata: Metadata<ModelWithEnumDeclared>

    beforeEach(() => {
      metadata = metadataForClass(ModelWithEnumDeclared)
    })

    it('should add enum type to property', () => {
      const enumPropertyMetadata = metadata.forProperty('type')!
      expect(enumPropertyMetadata.typeInfo).toBeDefined()
      expect(enumPropertyMetadata.typeInfo).toEqual({ type: EnumType, isCustom: true })
    })
  })

  describe('with inheritance', () => {
    it('should override the table name', () => {
      @Model({ tableName: 'super-table-name' })
      class A {}

      @Model({ tableName: 'my-real-table-name' })
      class B extends A {}

      const metaData = metadataForModel(B)
      expect(metaData.tableName).toBe('my-real-table-name')
    })

    it("should contain the super-class' and own properties", () => {
      @Model()
      class A {
        @PartitionKey()
        myPartitionKey: string

        @SortKey()
        mySortKey: number
      }

      @Model()
      class B extends A {
        @SortedSet()
        myOwnProp: string[]
      }

      const metaData = metadataForModel(B)

      expect(metaData.properties).toBeDefined()
      expect(metaData.properties!.length).toBe(3)

      expect(metadataForProperty(B, 'myPartitionKey')).toBeDefined()
      expect(metadataForProperty(B, 'mySortKey')).toBeDefined()
      expect(metadataForProperty(B, 'myOwnProp')).toBeDefined()
    })

    it("should contain the super-class' and own indexes", () => {
      @Model()
      class A {
        @PartitionKey()
        myPartitionKey: string

        @GSIPartitionKey('my-gsi')
        myGsiPartitionKey: string

        @GSISortKey('my-gsi')
        myGsiSortKey: number

        @LSISortKey('my-lsi')
        myLsiSortKey: number
      }

      @Model()
      class B extends A {
        @GSIPartitionKey('my-other-gsi')
        myOtherGsiPartitionKey: string
      }

      const metaData = metadataForModel(B)

      expect(metaData.properties).toBeDefined()
      expect(metaData.properties!.length).toBe(5)

      expect(metadataForProperty(B, 'myPartitionKey')).toBeDefined()
      expect(metadataForProperty(B, 'myGsiPartitionKey')).toBeDefined()
      expect(metadataForProperty(B, 'myGsiSortKey')).toBeDefined()
      expect(metadataForProperty(B, 'myLsiSortKey')).toBeDefined()
      expect(metadataForProperty(B, 'myOtherGsiPartitionKey')).toBeDefined()

      expect(metaData.indexes).toBeDefined()
      expect(metaData.indexes!.get('my-gsi')).toBeDefined()
      expect(metaData.indexes!.get('my-lsi')).toBeDefined()
      expect(metaData.indexes!.get('my-other-gsi')).toBeDefined()
    })

    it("should contain the super-class' and own transient properties", () => {
      @Model()
      class A {
        @Transient()
        myTransientProp: string
      }

      @Model()
      class B extends A {
        @Transient()
        myOtherTransientProp: number
      }

      const metaData = metadataForModel(B)
      expect(metaData.transientProperties).toBeDefined()
      expect(metaData.transientProperties!.length).toBe(2)
      expect(metaData.transientProperties!.includes('myTransientProp')).toBeTruthy()
      expect(metaData.transientProperties!.includes('myOtherTransientProp')).toBeTruthy()
    })

    it(`should not contains 'sibling' props `, () => {
      @Model()
      class A {
        @Property()
        aProp: string
      }

      @Model()
      class B extends A {
        @Property()
        bProp: string
      }

      @Model()
      class C extends A {
        @Property()
        cProp: string
      }

      const aMetaData = metadataForModel(A)
      const bMetaData = metadataForModel(B)
      const cMetaData = metadataForModel(C)

      expect(aMetaData.properties).toBeDefined()
      expect(aMetaData.properties!.length).toBe(1)

      expect(bMetaData.properties).toBeDefined()
      expect(bMetaData.properties!.length).toBe(2)
      expect(metadataForProperty(B, 'bProp')).toBeDefined()
      expect(metadataForProperty(B, 'cProp')).toBeFalsy()

      expect(cMetaData.properties).toBeDefined()
      expect(cMetaData.properties!.length).toBe(2)
      expect(metadataForProperty(C, 'cProp')).toBeDefined()
      expect(metadataForProperty(C, 'bProp')).toBeFalsy()
    })

    it('should not alter super props', () => {
      @Model()
      class A {
        @Property()
        aProp: string
      }

      @Model()
      class B extends A {
        @Property({ name: 'bProp' })
        aProp: string
      }

      const aMeta = metadataForModel(A)
      expect(aMeta.properties).toBeDefined()
      expect(aMeta.properties!.length).toBe(1)

      const aPropMeta = aMeta.properties![0]
      expect(aPropMeta).toBeDefined()
      expect(aPropMeta!.name).toBe('aProp')
      expect(aPropMeta!.nameDb).toBe('aProp')

      const bMeta = metadataForModel(B)
      expect(bMeta.properties).toBeDefined()
      expect(bMeta.properties!.length).toBe(1)

      const bPropMeta = bMeta.properties![0]
      expect(bPropMeta).toBeDefined()
      expect(bPropMeta!.name).toBe('aProp')
      expect(bPropMeta!.nameDb).toBe('bProp')
    })

    it('should have all parents props even if empty', () => {
      @Model()
      class A {
        @Property()
        aProp: string
      }

      @Model()
      class B extends A {}

      const bMeta = metadataForModel(B)

      expect(bMeta.properties).toBeDefined()
      expect(bMeta.properties!.length).toBe(1)
    })

    it('should work for real world scenario 1', () => {
      const metadata = metadataForClass(Form)
      expect(metadata.modelOptions.properties!.length).toBe(4)
      const meta = metadata.forProperty('id')
      expect(meta).toBeDefined()
    })
  })
})
