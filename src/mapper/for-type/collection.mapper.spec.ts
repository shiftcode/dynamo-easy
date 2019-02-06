import { NestedObject } from '../../../test/models'
import { ModelWithCollections } from '../../../test/models/model-with-collections.model'
import { Metadata } from '../../decorator/metadata/metadata'
import { metadataForModel } from '../../decorator/metadata/metadata-helper'
import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { ListAttribute, NumberSetAttribute, StringSetAttribute } from '../type/attribute.type'
import { CollectionMapper } from './collection.mapper'

describe('collection mapper', () => {
  describe('to db', () => {
    describe('no metadata', () => {
      /*
       * Arrays
       */
      it('arr (homogeneous string) => L', () => {
        const attributeValue = CollectionMapper.toDb(['value1', 'value2', 'value3'])
        expect(attributeValue).toEqual({ L: [{ S: 'value1' }, { S: 'value2' }, { S: 'value3' }] })
      })

      it('arr (homogeneous number) => L', () => {
        const attributeValue = CollectionMapper.toDb([5, 10])
        expect(attributeValue).toEqual({ L: [{ N: '5' }, { N: '10' }] })
      })

      it('arr (homogeneous objects)', () => {
        const attributeValue = <ListAttribute>CollectionMapper.toDb([{ name: 'name1' }, { name: 'name2' }])
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ M: { name: { S: 'name1' } } }, { M: { name: { S: 'name2' } } }])
      })

      it('arr (heterogeneous)', () => {
        const attributeValue = <ListAttribute>CollectionMapper.toDb(['value1', 10])
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { N: '10' }])
      })

      /*
       * Set
       */
      it('set (homogeneous string)', () => {
        const attributeValue = <StringSetAttribute>CollectionMapper.toDb(new Set(['value1', 'value2', 'value3']))
        expect(Object.keys(attributeValue)[0]).toBe('SS')
        expect(Array.isArray(attributeValue.SS)).toBeTruthy()
        expect(attributeValue.SS.length).toBe(3)
        expect(attributeValue.SS).toEqual(['value1', 'value2', 'value3'])
      })

      it('set (homogeneous number)', () => {
        const attributeValue = <NumberSetAttribute>CollectionMapper.toDb(new Set([5, 10]))
        expect(Object.keys(attributeValue)[0]).toBe('NS')
        expect(Array.isArray(attributeValue.NS)).toBeTruthy()
        expect(attributeValue.NS.length).toBe(2)
        expect(attributeValue.NS).toEqual(['5', '10'])
      })

      it('set with objects should throw', () => {
        expect(() => CollectionMapper.toDb(new Set([{ name: 'name1' }, { name: 'name2' }]))).toThrow()
      })

      it('heterogeneous set should throw', () => {
        expect(() => CollectionMapper.toDb(new Set(['value1', 10]))).toThrow()
      })
    })

    describe('with metadata', () => {
      const metadata: PropertyMetadata<any> = <any>{
        typeInfo: {
          type: Array,
        },
        isSortedCollection: true,
      }

      it('set (homogeneous, generic type is string)', () => {
        const attributeValue = <StringSetAttribute>CollectionMapper.toDb(new Set(['value1', 'value2', 'value3']), <any>{
          typeInfo: { type: Set, genericType: String },
        })
        expect(Object.keys(attributeValue)[0]).toBe('SS')
        expect(Array.isArray(attributeValue.SS)).toBeTruthy()
        expect(attributeValue.SS.length).toBe(3)
        expect(attributeValue.SS).toEqual(['value1', 'value2', 'value3'])
      })

      it('sorted arr (homogeneous string)', () => {
        const attributeValue = <ListAttribute>CollectionMapper.toDb(['value1', 'value2', 'value3'], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(3)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { S: 'value2' }, { S: 'value3' }])
      })

      it('sorted arr (homogeneous number)', () => {
        const attributeValue = <ListAttribute>CollectionMapper.toDb([5, 10], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ N: '5' }, { N: '10' }])
      })

      it('sorted set (homogeneous string)', () => {
        const attributeValue = <ListAttribute>(
          CollectionMapper.toDb(new Set(['value1', 'value2', 'value3']), <any>metadata)
        )
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(3)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { S: 'value2' }, { S: 'value3' }])
      })

      it('sorted set (homogeneous number)', () => {
        const attributeValue = <ListAttribute>CollectionMapper.toDb([5, 10], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ N: '5' }, { N: '10' }])
      })
    })

    describe('with CollectionProperty decorator', () => {
      let metadata: Metadata<ModelWithCollections>
      let aDate: Date
      let aStringArray: string[]
      let aNestedObject: NestedObject

      beforeEach(() => {
        metadata = metadataForModel(ModelWithCollections)
        aDate = new Date()
        aStringArray = ['Hello', 'World']
        aNestedObject = { id: 'myId' }
      })

      it('array to (L)ist (itemType)', () => {
        const propMeta = metadata.forProperty('arrayOfNestedModelToList')
        const val: ModelWithCollections['arrayOfNestedModelToList'] = [{ updated: aDate }]

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({
          L: [{ M: { updated: { S: aDate.toISOString() } } }],
        })
      })
      it('set to (L)ist (itemType)', () => {
        const propMeta = metadata.forProperty('setOfNestedModelToList')
        const val: ModelWithCollections['setOfNestedModelToList'] = new Set([{ updated: aDate }])

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({
          L: [{ M: { updated: { S: aDate.toISOString() } } }],
        })
      })

      it('array to (L)ist (nested object)', () => {
        const propMeta = metadata.forProperty('arrayOfObjectsToList')
        const val: ModelWithCollections['arrayOfObjectsToList'] = [aNestedObject]

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({ L: [{ M: { id: { S: aNestedObject.id } } }] })
      })
      it('set to (L)ist (nested object)', () => {
        const propMeta = metadata.forProperty('setOfObjectsToList')
        const val: ModelWithCollections['setOfObjectsToList'] = new Set([aNestedObject])

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({ L: [{ M: { id: { S: aNestedObject.id } } }] })
      })

      it('array to List ', () => {
        const propMeta = metadata.forProperty('arrayOfStringToSet')
        const val: ModelWithCollections['arrayOfStringToSet'] = aStringArray

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({ L: aStringArray.map(t => ({ S: t })) })
      })
      it('set to (S)et (primitive type)', () => {
        const propMeta = metadata.forProperty('setOfStringToSet')
        const val: ModelWithCollections['setOfStringToSet'] = new Set(aStringArray)

        expect(CollectionMapper.toDb(val, <any>propMeta)).toEqual({ SS: aStringArray })
      })
    })
  })

  describe('from db', () => {
    describe('no metadata', () => {
      /*
       * S(et)
       */
      it('arr (homogeneous string)', () => {
        const stringSet = <Set<string>>CollectionMapper.fromDb({ SS: ['value1', 'value2', 'value3'] })
        expect(stringSet instanceof Set).toBeTruthy()
        expect(stringSet.size).toBe(3)
        expect(typeof Array.from(stringSet)[0]).toBe('string')
      })

      it('arr (homogeneous number)', () => {
        const numberSet = <Set<number>>CollectionMapper.fromDb({ NS: ['25', '10'] })
        expect(numberSet instanceof Set).toBeTruthy()
        expect(numberSet.size).toBe(2)
        expect(typeof Array.from(numberSet)[0]).toBe('number')
      })
    })
  })
})
