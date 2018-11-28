import { PropertyMetadata } from '../../decorator/metadata/property-metadata.model'
import { ListAttribute, NumberSetAttribute, StringSetAttribute } from '../type/attribute.type'
import { CollectionMapper } from './collection.mapper'

describe('collection mapper', () => {
  let mapper: CollectionMapper

  beforeEach(() => {
    mapper = new CollectionMapper()
  })

  describe('to db', () => {
    describe('no metadata', () => {
      /*
       * Arrays
       */
      it('arr (homogeneous string)', () => {
        const attributeValue = <StringSetAttribute>mapper.toDb(['value1', 'value2', 'value3'])
        expect(Object.keys(attributeValue)[0]).toBe('SS')
        expect(Array.isArray(attributeValue.SS)).toBeTruthy()
        expect(attributeValue.SS.length).toBe(3)
        expect(attributeValue.SS).toEqual(['value1', 'value2', 'value3'])
      })

      it('arr (homogeneous number)', () => {
        const attributeValue = <NumberSetAttribute>mapper.toDb([5, 10])
        expect(Object.keys(attributeValue)[0]).toBe('NS')
        expect(Array.isArray(attributeValue.NS)).toBeTruthy()
        expect(attributeValue.NS.length).toBe(2)
        expect(attributeValue.NS).toEqual(['5', '10'])
      })

      it('arr (homogeneous objects)', () => {
        const attributeValue = <ListAttribute>mapper.toDb([{ name: 'name1' }, { name: 'name2' }])
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ M: { name: { S: 'name1' } } }, { M: { name: { S: 'name2' } } }])
      })

      it('arr (heterogeneous)', () => {
        const attributeValue = <ListAttribute>mapper.toDb(['value1', 10])
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { N: '10' }])
      })

      /*
       * Set
       */
      it('set (homogeneous string)', () => {
        const attributeValue = <StringSetAttribute>mapper.toDb(new Set(['value1', 'value2', 'value3']))
        expect(Object.keys(attributeValue)[0]).toBe('SS')
        expect(Array.isArray(attributeValue.SS)).toBeTruthy()
        expect(attributeValue.SS.length).toBe(3)
        expect(attributeValue.SS).toEqual(['value1', 'value2', 'value3'])
      })

      it('set (homogeneous number)', () => {
        const attributeValue = <NumberSetAttribute>mapper.toDb(new Set([5, 10]))
        expect(Object.keys(attributeValue)[0]).toBe('NS')
        expect(Array.isArray(attributeValue.NS)).toBeTruthy()
        expect(attributeValue.NS.length).toBe(2)
        expect(attributeValue.NS).toEqual(['5', '10'])
      })

      it('set (homogeneous objects)', () => {
        const attributeValue = <ListAttribute>mapper.toDb(new Set([{ name: 'name1' }, { name: 'name2' }]))
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ M: { name: { S: 'name1' } } }, { M: { name: { S: 'name2' } } }])
      })

      it('set (heterogeneous)', () => {
        const attributeValue = <ListAttribute>mapper.toDb(new Set(['value1', 10]))
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { N: '10' }])
      })
    })

    describe('metadata', () => {
      const metadata: PropertyMetadata<any> = <any>{
        typeInfo: {
          type: Array,
        },
        isSortedCollection: true,
      }

      it('set (homogeneous, generic type is string)', () => {
        const attributeValue = <StringSetAttribute>mapper.toDb(new Set(['value1', 'value2', 'value3']), <any>{
          typeInfo: { type: Set, genericType: String },
        })
        expect(Object.keys(attributeValue)[0]).toBe('SS')
        expect(Array.isArray(attributeValue.SS)).toBeTruthy()
        expect(attributeValue.SS.length).toBe(3)
        expect(attributeValue.SS).toEqual(['value1', 'value2', 'value3'])
      })

      it('sorted arr (homogeneous string)', () => {
        const attributeValue = <ListAttribute>mapper.toDb(['value1', 'value2', 'value3'], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(3)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { S: 'value2' }, { S: 'value3' }])
      })

      it('sorted arr (homogeneous number)', () => {
        const attributeValue = <ListAttribute>mapper.toDb([5, 10], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ N: '5' }, { N: '10' }])
      })

      it('sorted set (homogeneous string)', () => {
        const attributeValue = <ListAttribute>mapper.toDb(new Set(['value1', 'value2', 'value3']), <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(3)
        expect(attributeValue.L).toEqual([{ S: 'value1' }, { S: 'value2' }, { S: 'value3' }])
      })

      it('sorted set (homogeneous number)', () => {
        const attributeValue = <ListAttribute>mapper.toDb([5, 10], <any>metadata)
        expect(Object.keys(attributeValue)[0]).toBe('L')
        expect(Array.isArray(attributeValue.L)).toBeTruthy()
        expect(attributeValue.L.length).toBe(2)
        expect(attributeValue.L).toEqual([{ N: '5' }, { N: '10' }])
      })
    })
  })

  describe('from db', () => {
    describe('no metadata', () => {
      /*
       * S(et)
       */
      it('arr (homogeneous string)', () => {
        const stringSet = <Set<string>>mapper.fromDb({ SS: ['value1', 'value2', 'value3'] })
        expect(stringSet instanceof Set).toBeTruthy()
        expect(stringSet.size).toBe(3)
        expect(typeof Array.from(stringSet)[0]).toBe('string')
      })

      it('arr (homogeneous number)', () => {
        const numberSet = <Set<number>>mapper.fromDb({ NS: ['25', '10'] })
        expect(numberSet instanceof Set).toBeTruthy()
        expect(numberSet.size).toBe(2)
        expect(typeof Array.from(numberSet)[0]).toBe('number')
      })
    })
  })
})
