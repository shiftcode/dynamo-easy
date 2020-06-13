/* eslint-disable no-new-wrappers */
import { Employee } from '../../test/models'
import { NullType } from './type/null.type'
import { UndefinedType } from './type/undefined.type'
import {
  detectCollectionTypeFromValue,
  detectType,
  isCollection,
  isHomogeneous,
  isNode,
  isSet,
  typeName,
  typeOf,
  typeOfFromDb,
} from './util'

describe('Util', () => {
  describe('is set', () => {
    it('Set instance', () => {
      const set: Set<string> = new Set(['foo', 'bar'])
      expect(isSet(set)).toBeTruthy()
    })

    it('array (using literal)', () => {
      const arr: string[] = ['foo', 'bar']
      expect(isSet(arr)).toBeFalsy()
    })

    it('array (using constructor)', () => {
      const arr: string[] = new Array()
      arr.push('foo', 'bar')
      expect(isSet(arr)).toBeFalsy()
    })
  })

  describe('is collection', () => {
    it('set is collection', () => {
      const set: Set<string> = new Set(['foo', 'bar'])
      expect(isCollection(set)).toBeTruthy()
    })

    it('array (using literal) is collection', () => {
      const arr: string[] = ['foo', 'bar']
      expect(isCollection(arr)).toBeTruthy()
    })

    it('array (using constructor) is collection', () => {
      const arr: string[] = new Array()
      arr.push('foo', 'bar')
      expect(isCollection(arr)).toBeTruthy()
    })

    it('all falsey', () => {
      expect(isCollection('doAddCondition')).toBeFalsy()
      expect(isCollection(5)).toBeFalsy()
      expect(isCollection(null)).toBeFalsy()
      expect(isCollection(true)).toBeFalsy()
      expect(isCollection({ foo: 'foo', bar: 5 })).toBeFalsy()
    })
  })

  describe('detect collection type without property metadata', () => {
    it('set (empty)', () => {
      const collection: Set<string> = new Set()
      expect(detectCollectionTypeFromValue(collection)).toBe('SS')
    })

    it('set with string values', () => {
      const collection: Set<string> = new Set(['foo', 'bar'])
      expect(detectCollectionTypeFromValue(collection)).toBe('SS')
    })

    it('set with number values', () => {
      const collection: Set<number> = new Set([25, 65])
      expect(detectCollectionTypeFromValue(collection)).toBe('NS')
    })

    it('set with no values', () => {
      const collection: Set<any> = new Set()
      expect(detectCollectionTypeFromValue(collection)).toBe('SS')
    })

    it('set with object values should throw', () => {
      const collection: Set<any> = new Set([{ foo: 'foo' }, { bar: 'bar' }])
      expect(() => detectCollectionTypeFromValue(collection)).toThrow()
    })

    it('set with values of different type should throw', () => {
      const collection: Set<any> = new Set(['foo', 5])
      expect(() => detectCollectionTypeFromValue(collection)).toThrow()
    })
  })

  describe('detect type', () => {
    it('detects string', () => {
      expect(detectType('aString')).toBe('S')
      expect(detectType(String('aString'))).toBe('S')
      expect(detectType(new String('aString'))).toBe('S')
    })
    it('detects number', () => {
      expect(detectType(3)).toBe('N')
      expect(detectType(Number(-5))).toBe('N')
      expect(detectType(new Number(83))).toBe('N')
    })
    it('detects binary', () => {
      let buffer: any
      if (isNode()) {
        buffer = Buffer.alloc(5)
      } else {
        buffer = new ArrayBuffer(8)
      }
      expect(detectType(buffer)).toBe('B')
    })
    it('detects null', () => {
      expect(detectType(null)).toBe('NULL')
    })
    it('detects bool', () => {
      expect(detectType(true)).toBe('BOOL')
      expect(detectType(false)).toBe('BOOL')
      expect(detectType(new Boolean(1))).toBe('BOOL')
    })
    it('detects collection', () => {
      expect(detectType(new Set(['a']))).toBe('SS')
      expect(detectType(new Set([2]))).toBe('NS')
      expect(detectType([0, 1, 1, 2, 3, 5])).toBe('L')
    })
    it('detects object', () => {
      expect(detectType({})).toBe('M')
      expect(detectType({ foo: 'bar' })).toBe('M')
    })
    it('throws if not such a type', () => {
      expect(() => detectType(undefined)).toThrow()
    })
  })

  describe('type name', () => {
    it('String', () => {
      expect(typeName(String)).toBe('String')
    })

    it('Number', () => {
      expect(typeName(Number)).toBe('Number')
    })

    it('NaN', () => {
      expect(typeName(NaN)).toBe('NaN')
    })

    it('Boolean', () => {
      expect(typeName(Boolean)).toBe('Boolean')
    })

    it('Set', () => {
      expect(typeName(Set)).toBe('Set')
    })

    it('Map', () => {
      expect(typeName(Map)).toBe('Map')
    })

    it('Object', () => {
      expect(typeName({})).toBe('[object Object]')
    })

    it('Null', () => {
      expect(typeName(NullType)).toBe('NullType')
    })

    it('Null', () => {
      expect(typeName(null)).toBe('Null')
    })

    it('UndefinedType', () => {
      expect(typeName(UndefinedType)).toBe('UndefinedType')
    })

    it('Undefined', () => {
      expect(typeName(undefined)).toBe('Undefined')
    })
  })

  describe('typeof', () => {
    it('string', () => {
      expect(typeOf('foo')).toBe(String)
    })

    it('number', () => {
      expect(typeOf(253)).toBe(Number)
    })

    it('number', () => {
      expect(typeOf(-521)).toBe(Number)
    })

    it('number (NaN)', () => {
      expect(typeOf(NaN)).toBe(Number)
    })

    it('boolean', () => {
      expect(typeOf(true)).toBe(Boolean)
    })

    it('array', () => {
      expect(typeOf(['foo', 'bar'])).toBe(Array)
    })

    it('set', () => {
      expect(typeOf(new Set(['foo', 'bar']))).toBe(Set)
    })

    it('map', () => {
      expect(typeOf(new Map())).toBe(Map)
    })

    it('object', () => {
      expect(typeOf({ foo: 'foo', bar: 45 })).toBe(Object)
    })

    it('null', () => {
      expect(typeOf(null)).toBe(NullType)
    })

    it('undefined', () => {
      let undfn: undefined
      expect(typeOf(undfn)).toBe(UndefinedType)
    })

    // object with type casting to custom
    it('object', () => {
      expect(typeOf(<Employee>{ name: 'foo', age: 45 })).toBe(Object)
    })

    it('custom class (Employee)', () => {
      expect(typeOf(new Employee('foo', 45, null, null))).toBe(Object)
    })
  })

  describe('typeOfFromDb', () => {
    it('string', () => {
      expect(typeOfFromDb({ S: 'myStrig' })).toBe(String)
    })

    it('number', () => {
      expect(typeOfFromDb({ N: '253' })).toBe(Number)
    })

    it('boolean', () => {
      expect(typeOfFromDb({ BOOL: true })).toBe(Boolean)
    })

    it('array', () => {
      expect(typeOfFromDb({ L: [{ S: 'foo' }, { S: 'bar' }] })).toBe(Array)
    })

    it('set', () => {
      expect(typeOfFromDb({ SS: ['foo', 'bar'] })).toBe(Set)
    })

    it('object', () => {
      expect(typeOfFromDb({ M: { foo: { S: 'foo' }, bar: { N: '45' } } })).toBe(Object)
    })

    it('null', () => {
      expect(typeOfFromDb({ NULL: true })).toBe(NullType)
    })

    it('undefined', () => {
      expect(() => {
        typeOfFromDb(undefined)
      }).toThrowError()
    })
  })

  describe('isHomogeneous', () => {
    describe('array', () => {
      it('array (homo -> number)', () => {
        const { homogeneous, type } = isHomogeneous([1, 2, 3])
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('N')
      })

      it('array (homo -> string)', () => {
        const { homogeneous, type } = isHomogeneous(['one', 'two', 'three'])
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('S')
      })

      it('array (homo -> boolean)', () => {
        const { homogeneous, type } = isHomogeneous([true, false, false])
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('BOOL')
      })

      it('array (homo -> boolean)', () => {
        const { homogeneous, type } = isHomogeneous(['one', 2, false])
        expect(homogeneous).toBeFalsy()
        expect(type).toBeUndefined()
      })
    })

    describe('set', () => {
      it('set (homo -> number)', () => {
        const { homogeneous, type } = isHomogeneous(new Set([1, 2, 3]))
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('N')
      })

      it('set (homo -> string)', () => {
        const { homogeneous, type } = isHomogeneous(new Set(['one', 'two', 'three']))
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('S')
      })

      it('set (homo -> boolean)', () => {
        const { homogeneous, type } = isHomogeneous(new Set([true, false, false]))
        expect(homogeneous).toBeTruthy()
        expect(type).toBe('BOOL')
      })

      it('set (hetero)', () => {
        const { homogeneous, type } = isHomogeneous(new Set(['one', 2, false]))
        expect(homogeneous).toBeFalsy()
        expect(type).toBeUndefined()
      })
    })
  })
})
