import * as moment from 'moment'
import { Employee } from '../../test/models/employee.model'
import { MomentType } from '../decorator/impl/date/moment.type'
import { NullType } from './type/null.type'
import { UndefinedType } from './type/undefined.type'
import { Util } from './util'

describe('Util', () => {
  describe('matches convention', () => {
    it('date', () => {
      ;['date', 'createdAt', 'lastUpdatedDate', 'myDateAndMore'].forEach(propertyName => {
        expect(Util.typeByConvention(propertyName)).toBe('date')
      })
      ;['Date', 'at', 'name'].forEach(propertyName => {
        expect(Util.typeByConvention(propertyName)).toBeUndefined()
      })
    })
  })

  describe('is set', () => {
    it('Set instance', () => {
      const set: Set<string> = new Set(['foo', 'bar'])
      expect(Util.isSet(set)).toBeTruthy()
    })

    it('array (using literal)', () => {
      const arr: string[] = ['foo', 'bar']
      expect(Util.isSet(arr)).toBeFalsy()
    })

    it('array (using constructor)', () => {
      const arr: string[] = new Array()
      arr.push('foo', 'bar')
      expect(Util.isSet(arr)).toBeFalsy()
    })
  })

  describe('is collection', () => {
    it('set is collection', () => {
      const set: Set<string> = new Set(['foo', 'bar'])
      expect(Util.isCollection(set)).toBeTruthy()
    })

    it('array (using literal) is collection', () => {
      const arr: string[] = ['foo', 'bar']
      expect(Util.isCollection(arr)).toBeTruthy()
    })

    it('array (using constructor) is collection', () => {
      const arr: string[] = new Array()
      arr.push('foo', 'bar')
      expect(Util.isCollection(arr)).toBeTruthy()
    })

    it('all falsey', () => {
      expect(Util.isCollection('doAddCondition')).toBeFalsy()
      expect(Util.isCollection(5)).toBeFalsy()
      expect(Util.isCollection(null)).toBeFalsy()
      expect(Util.isCollection(true)).toBeFalsy()
      expect(Util.isCollection({ foo: 'foo', bar: 5 })).toBeFalsy()
    })
  })

  describe('detect collection type', () => {
    it('set with string values', () => {
      const collection: Set<string> = new Set(['foo', 'bar'])
      expect(Util.detectCollectionType(collection)).toBe('SS')
    })

    it('set with number values', () => {
      const collection: Set<number> = new Set([25, 65])
      expect(Util.detectCollectionType(collection)).toBe('NS')
    })

    // TODO implement binary
    // it('set with binary values', ()=>{
    //   const collection: Set<string> = new Set(['foo', 'bar']);
    //   expect(Util.detectCollectionType(collection)).toBe('BS');
    // })

    it('set with object values', () => {
      const collection: Set<any> = new Set([{ foo: 'foo' }, { bar: 'bar' }])
      expect(Util.detectCollectionType(collection)).toBe('L')
    })
  })

  describe('type name', () => {
    it('String', () => {
      expect(Util.typeName(String)).toBe('String')
    })

    it('Number', () => {
      expect(Util.typeName(Number)).toBe('Number')
    })

    it('NaN', () => {
      expect(Util.typeName(NaN)).toBe('NaN')
    })

    it('Boolean', () => {
      expect(Util.typeName(Boolean)).toBe('Boolean')
    })

    it('Set', () => {
      expect(Util.typeName(Set)).toBe('Set')
    })

    it('Map', () => {
      expect(Util.typeName(Map)).toBe('Map')
    })

    it('Moment', () => {
      expect(Util.typeName(MomentType)).toBe('MomentType')
    })

    it('Date', () => {
      expect(Util.typeName(Date)).toBe('Date')
    })

    it('Object', () => {
      expect(Util.typeName({})).toBe('[object Object]')
    })

    it('Null', () => {
      expect(Util.typeName(NullType)).toBe('NullType')
    })

    it('Null', () => {
      expect(Util.typeName(null)).toBe('Null')
    })

    it('UndefinedType', () => {
      expect(Util.typeName(UndefinedType)).toBe('UndefinedType')
    })

    it('Undefined', () => {
      expect(Util.typeName(undefined)).toBe('Undefined')
    })
  })

  // TODO add binary test
  describe('typeof', () => {
    it('string', () => {
      expect(Util.typeOf('foo')).toBe(String)
    })

    it('number', () => {
      expect(Util.typeOf(253)).toBe(Number)
    })

    it('number (NaN)', () => {
      const nan = NaN
      expect(Util.typeOf(nan)).toBe(Number)
    })

    it('boolean', () => {
      expect(Util.typeOf(true)).toBe(Boolean)
    })

    it('date', () => {
      expect(Util.typeOf(new Date())).toBe(Date)
    })

    it('moment', () => {
      const m: moment.Moment = moment()
      expect(Util.typeOf(m)).toBe(MomentType)
    })

    it('array', () => {
      expect(Util.typeOf(['foo', 'bar'])).toBe(Array)
    })

    it('set', () => {
      expect(Util.typeOf(new Set(['foo', 'bar']))).toBe(Set)
    })

    it('map', () => {
      expect(Util.typeOf(new Map())).toBe(Map)
    })

    it('object', () => {
      expect(Util.typeOf({ foo: 'foo', bar: 45 })).toBe(Object)
    })

    it('null', () => {
      expect(Util.typeOf(null)).toBe(NullType)
    })

    it('undefined', () => {
      // tslint:disable-next-line:prefer-const
      let undfn: undefined
      expect(Util.typeOf(undfn)).toBe(UndefinedType)
    })

    // object with type casting to custom
    it('object', () => {
      expect(Util.typeOf(<Employee>{ name: 'foo', age: 45 })).toBe(Object)
    })

    it('custom class (Employee)', () => {
      expect(Util.typeOf(new Employee('foo', 45, null, null))).toBe(Object)
    })
  })

  describe('typeOfFromDb', () => {
    it('string', () => {
      expect(Util.typeOfFromDb({ S: 'myStrig' })).toBe(String)
    })

    it('number', () => {
      expect(Util.typeOfFromDb({ N: '253' })).toBe(Number)
    })

    it('boolean', () => {
      expect(Util.typeOfFromDb({ BOOL: true })).toBe(Boolean)
    })

    it('moment', () => {
      const m: moment.Moment = moment()
      expect(
        Util.typeOfFromDb({
          S: m
            .clone()
            .utc()
            .format(),
        })
      ).toBe(MomentType)
    })

    it('array', () => {
      expect(Util.typeOfFromDb({ L: [{ S: 'foo' }, { S: 'bar' }] })).toBe(Array)
    })

    it('set', () => {
      expect(Util.typeOfFromDb({ SS: ['foo', 'bar'] })).toBe(Set)
    })

    it('object', () => {
      expect(Util.typeOfFromDb({ M: { foo: { S: 'foo' }, bar: { N: '45' } } })).toBe(Object)
    })

    it('null', () => {
      expect(Util.typeOfFromDb({ NULL: true })).toBe(NullType)
    })

    it('undefined', () => {
      expect(() => {
        Util.typeOfFromDb(undefined)
      }).toThrowError()
    })
  })
})
