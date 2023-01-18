// tslint:disable:max-classes-per-file
import { FailModel } from '../../test/models/fail-model.model'
import { ModelWithCollections } from '../../test/models/model-with-collections.model'
import { FormId, formIdMapper, FormType } from '../../test/models/real-world'
import { MapperForType } from './for-type/base.mapper'
import { fromDb, toDb } from './mapper'
import { Attributes, NumberAttribute, StringAttribute } from './type/attribute.type'
import {
  arrayToListAttribute,
  arrayToSetAttribute,
  listAttributeToArray,
  setAttributeToArray,
  wrapMapperForDynamoListJsArray,
  wrapMapperForDynamoListJsSet,
  wrapMapperForDynamoSetJsArray,
  wrapMapperForDynamoSetJsSet,
} from './wrap-mapper-for-collection.function'

class MyNumber {
  value: number
}

class MyChar {
  value: string // char
}

const myNumberToStringAttrMapper: MapperForType<MyNumber, StringAttribute> = {
  toDb: (propertyValue) => ({ S: `${propertyValue.value}` }),
  fromDb: (attributeValue) => ({ value: parseInt(attributeValue.S, 10) }),
}
const myCharToNumberAttrMapper: MapperForType<MyChar, NumberAttribute> = {
  toDb: (propertyValue) => ({ N: `${propertyValue.value.charCodeAt(0)}` }),
  fromDb: (attributeValue) => ({ value: String.fromCharCode(parseInt(attributeValue.N, 10)) }),
}
describe('wrap mapper for collection', () => {
  describe('arrayToListAttribute', () => {
    it('should map empty array to empty (L)ist', () => {
      expect(arrayToListAttribute(myNumberToStringAttrMapper)([])).toEqual({ L: [] })
    })
    it('should map array to list with given mapper', () => {
      expect(arrayToListAttribute(myNumberToStringAttrMapper)([{ value: 7 }])).toEqual({ L: [{ S: '7' }] })
    })
  })

  describe('listAttributeToArray', () => {
    it('should parse empty list to empty array', () => {
      expect(listAttributeToArray(myNumberToStringAttrMapper)({ L: [] })).toEqual([])
    })
    it('should parse list to array with given mapper', () => {
      expect(listAttributeToArray(myNumberToStringAttrMapper)({ L: [{ S: '7' }] })).toEqual([{ value: 7 }])
    })
  })

  describe('arrayToSetAttribute', () => {
    it('should map empty array to null', () => {
      expect(arrayToSetAttribute(myNumberToStringAttrMapper)([])).toEqual(null)
    })
    it('should map array to (S)et', () => {
      expect(arrayToSetAttribute(myNumberToStringAttrMapper)([{ value: 7 }])).toEqual({ SS: ['7'] })
      expect(arrayToSetAttribute(myCharToNumberAttrMapper)([{ value: 'A' }])).toEqual({ NS: ['65'] })
    })
  })

  describe('setAttributeToArray', () => {
    it('should parse (S)et to array', () => {
      expect(setAttributeToArray(myNumberToStringAttrMapper)({ SS: ['7'] })).toEqual([{ value: 7 }])
      expect(setAttributeToArray(myCharToNumberAttrMapper)({ NS: ['65'] })).toEqual([{ value: 'A' }])
    })
  })

  describe('wrapMapperForDynamoSetJsArray', () => {
    const wrappedMapper = wrapMapperForDynamoSetJsArray(myNumberToStringAttrMapper)
    it('maps correctly toDb', () => {
      const dbVal = wrappedMapper.toDb([{ value: 5 }])
      expect(dbVal).toEqual({ SS: ['5'] })
    })
    it('toDb throws if not an array is given', () => {
      expect(() => wrappedMapper.toDb(<any>new Set([{ value: 5 }]))).toThrow()
    })
    it('maps correctly fromDb', () => {
      const jsVal = wrappedMapper.fromDb({ SS: ['5', '1'] })
      expect(jsVal).toEqual([{ value: 5 }, { value: 1 }])
    })
    it('fromDb throws if not a Set was given', () => {
      // it does not throw, if it is a wrong set --> this should do the single item mapper
      // it only throws if it is not a set at all
      expect(() => wrappedMapper.fromDb(<any>{ S: '5' })).toThrow()
    })
  })

  describe('wrapMapperForDynamoSetJsSet', () => {
    const wrappedMapper = wrapMapperForDynamoSetJsSet(myNumberToStringAttrMapper)
    it('maps correctly toDb', () => {
      const dbVal = wrappedMapper.toDb(new Set([{ value: 5 }]))
      expect(dbVal).toEqual({ SS: ['5'] })
    })
    it('toDb throws if not a set is given', () => {
      expect(() => wrappedMapper.toDb(<any>[{ value: 5 }])).toThrow()
    })
    it('maps correctly fromDb', () => {
      const jsVal = wrappedMapper.fromDb({ SS: ['5', '1'] })
      expect(jsVal).toEqual(new Set([{ value: 5 }, { value: 1 }]))
    })
    it('fromDb throws if not a Set was given', () => {
      // it does not throw, if it is a wrong set --> this should do the single item mapper
      // it only throws if it is not a set at all
      expect(() => wrappedMapper.fromDb(<any>{ S: '5' })).toThrow()
    })
  })

  describe('wrapMapperForDynamoListJsArray', () => {
    const wrappedMapper = wrapMapperForDynamoListJsArray(myNumberToStringAttrMapper)
    it('maps correctly toDb', () => {
      const dbVal = wrappedMapper.toDb([{ value: 5 }])
      expect(dbVal).toEqual({ L: [{ S: '5' }] })
    })
    it('toDb throws if not an array is given', () => {
      expect(() => wrappedMapper.toDb(<any>new Set([{ value: 5 }]))).toThrow()
    })
    it('maps correctly fromDb', () => {
      const jsVal = wrappedMapper.fromDb({ L: [{ S: '5' }, { S: '1' }] })
      expect(jsVal).toEqual([{ value: 5 }, { value: 1 }])
    })
    it('fromDb throws if not a List was given', () => {
      expect(() => wrappedMapper.fromDb(<any>{ SS: ['5'] })).toThrow()
      expect(() => wrappedMapper.fromDb(<any>{ NS: ['5'] })).toThrow()
      expect(() => wrappedMapper.fromDb(<any>{ M: { S: '5' } })).toThrow()
    })
  })

  describe('wrapMapperForDynamoListJsSet', () => {
    const wrappedMapper = wrapMapperForDynamoListJsSet(myNumberToStringAttrMapper)
    it('maps correctly toDb', () => {
      const dbVal = wrappedMapper.toDb(new Set([{ value: 5 }]))
      expect(dbVal).toEqual({ L: [{ S: '5' }] })
    })
    it('toDb throws if not a set is given', () => {
      expect(() => wrappedMapper.toDb(<any>[{ value: 5 }])).toThrow()
    })
    it('maps correctly fromDb', () => {
      const jsVal = wrappedMapper.fromDb({ L: [{ S: '5' }, { S: '1' }] })
      expect(jsVal).toEqual(new Set([{ value: 5 }, { value: 1 }]))
    })
    it('fromDb throws if not a List was given', () => {
      expect(() => wrappedMapper.fromDb(<any>{ SS: ['5'] })).toThrow()
      expect(() => wrappedMapper.fromDb(<any>{ NS: ['5'] })).toThrow()
      expect(() => wrappedMapper.fromDb(<any>{ M: { S: '5' } })).toThrow()
    })
  })

  describe('for collection wrapped mappers', () => {
    describe('fromDb', () => {
      let aFormId: FormId
      beforeEach(() => {
        aFormId = new FormId(FormType.REQUEST, 55, 2020)
      })

      it('array to (L)ist (itemMapper, sorted)', () => {
        const dbObj: Attributes<ModelWithCollections> = {
          arrayOfFormIdToListWithStrings: { L: [formIdMapper.toDb(aFormId)] },
        }
        expect(fromDb(dbObj, ModelWithCollections)).toEqual({ arrayOfFormIdToListWithStrings: [aFormId] })
      })
      it('set to (L)ist (itemMapper, sorted)', () => {
        const dbObj: Attributes<ModelWithCollections> = {
          setOfFormIdToListWithStrings: { L: [formIdMapper.toDb(aFormId)] },
        }
        expect(fromDb(dbObj, ModelWithCollections)).toEqual({ setOfFormIdToListWithStrings: new Set([aFormId]) })
      })

      it('array to (S)et (itemMapper)', () => {
        const dbObj: Attributes<ModelWithCollections> = { arrayOfFormIdToSet: { SS: [FormId.unparse(aFormId)] } }
        expect(fromDb(dbObj, ModelWithCollections)).toEqual({ arrayOfFormIdToSet: [aFormId] })
      })
      it('set to (S)et (itemMapper)', () => {
        const dbObj: Attributes<ModelWithCollections> = { setOfFormIdToSet: { SS: [FormId.unparse(aFormId)] } }
        expect(fromDb(dbObj, ModelWithCollections)).toEqual({ setOfFormIdToSet: new Set([aFormId]) })
      })

      it('should throw when not a (S)et attribute', () => {
        const dbObj: Attributes<FailModel> = { myFail: { M: { id: { S: '42' } } } }
        expect(() => fromDb(dbObj, FailModel)).toThrow()
      })
    })

    describe('toDb', () => {
      let aFormId: FormId

      beforeEach(() => {
        aFormId = new FormId(FormType.REQUEST, 55, 2020)
      })

      it('array to (L)ist (itemMapper, sorted)', () => {
        expect(
          toDb(<Partial<ModelWithCollections>>{ arrayOfFormIdToListWithStrings: [aFormId] }, ModelWithCollections),
        ).toEqual({
          arrayOfFormIdToListWithStrings: { L: [formIdMapper.toDb(aFormId)] },
        })
      })
      it('set to (L)ist (itemMapper, sorted)', () => {
        expect(
          toDb(
            <Partial<ModelWithCollections>>{ setOfFormIdToListWithStrings: new Set([aFormId]) },
            ModelWithCollections,
          ),
        ).toEqual({
          setOfFormIdToListWithStrings: { L: [formIdMapper.toDb(aFormId)] },
        })
      })

      it('array to (S)et (itemMapper)', () => {
        expect(toDb(<Partial<ModelWithCollections>>{ arrayOfFormIdToSet: [aFormId] }, ModelWithCollections)).toEqual({
          arrayOfFormIdToSet: { SS: [FormId.unparse(aFormId)] },
        })
      })
      it('set to (S)et (itemMapper)', () => {
        expect(
          toDb(<Partial<ModelWithCollections>>{ setOfFormIdToSet: new Set([aFormId]) }, ModelWithCollections),
        ).toEqual({
          setOfFormIdToSet: { SS: [FormId.unparse(aFormId)] },
        })
      })

      it('should throw when wrong mapper', () => {
        expect(() => toDb({ myFail: [{ id: 42 }] }, FailModel)).toThrow()
      })
    })
  })
})
