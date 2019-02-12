import { SimpleWithPartitionKeyModel, UpdateModel } from '../../../test/models'
import { SpecialCasesModel } from '../../../test/models/special-cases-model.model'
import { metadataForModel } from '../../decorator/metadata/metadata-for-model.function'
import { UpdateActionDef } from './type/update-action-def'
import { buildUpdateExpression } from './update-expression-builder'

describe('buildUpdateExpression', () => {
  const metaDataS = metadataForModel(SimpleWithPartitionKeyModel)
  const metaDataU = metadataForModel(UpdateModel)

  it('should throw when operation.action is unknown', () => {
    const unknownOp = new UpdateActionDef('SET', <any>'subtract')
    expect(() => buildUpdateExpression('age', unknownOp, [3], [], metaDataS)).toThrow()
  })

  describe('incrementBy', () => {
    const op = new UpdateActionDef('SET', 'incrementBy')

    it('should build expression', () => {
      const exp = buildUpdateExpression('age', op, [23], [], metaDataS)
      expect(exp).toEqual({
        attributeNames: { '#age': 'age' },
        attributeValues: { ':age': { N: '23' } },
        statement: '#age = #age + :age',
        type: 'SET',
      })
    })

    it('should throw when not number', () => {
      expect(() => buildUpdateExpression('age', op, ['notANumber'], [], metaDataS)).toThrow()
    })
  })

  describe('decrementBy', () => {
    const op = new UpdateActionDef('SET', 'decrementBy')
    it('should build expression', () => {
      const exp = buildUpdateExpression('age', op, [23], [], metaDataS)
      expect(exp).toEqual({
        attributeNames: { '#age': 'age' },
        attributeValues: { ':age': { N: '23' } },
        statement: '#age = #age - :age',
        type: 'SET',
      })
    })

    it('should throw when not number', () => {
      expect(() => buildUpdateExpression('age', op, ['notANumber'], [], metaDataS)).toThrow()
    })
  })

  describe('set', () => {
    const op = new UpdateActionDef('SET', 'set')

    it('should build set expression for number[]', () => {
      const exp = buildUpdateExpression('numberValues', op, [[23]], [], metaDataU)
      expect(exp).toEqual({
        attributeNames: { '#numberValues': 'numberValues' },
        attributeValues: { ':numberValues': { L: [{ N: '23' }] } },
        statement: '#numberValues = :numberValues',
        type: 'SET',
      })
    })

    it('should build set expression for number at document path', () => {
      const exp = buildUpdateExpression('numberValues[0]', op, [23], [], metaDataU)
      expect(exp).toEqual({
        attributeNames: { '#numberValues': 'numberValues' },
        attributeValues: { ':numberValues_at_0': { N: '23' } },
        statement: '#numberValues[0] = :numberValues_at_0',
        type: 'SET',
      })
    })

    // it('should build set expression for custom type at document path', () => {
    //   const now = new Date()
    //   const exp = buildUpdateExpression('informations[0]', op, [{details: 'my detail', createdAt: now}], [], metaDataU)
    //   expect(exp).toEqual({
    //     attributeNames: { '#informations': 'informations' },
    //     attributeValues: { ':informations_at_0': { M: {details: {S: 'my detail' }, createdAt: dateToNumberMapper.toDb(now)} }},
    //     statement: '#informations[0] = :informations_at_0',
    //     type: 'SET',
    //   })
    // })
  })
  // describe('setAt', () => {})
  // describe('appendToList', () => {})
  // describe('remove', () => {})
  // describe('removeFromListAt', () => {})

  describe('add', () => {
    const op = new UpdateActionDef('ADD', 'add')

    it('should build add expression for numbers', () => {
      const exp = buildUpdateExpression('age', op, [23], [], metaDataS)
      expect(exp).toEqual({
        attributeNames: { '#age': 'age' },
        attributeValues: { ':age': { N: '23' } },
        statement: '#age :age',
        type: 'ADD',
      })
    })

    it('should work with customMapper (1)', () => {
      const metaDataC = metadataForModel(SpecialCasesModel)
      const exp = buildUpdateExpression('myChars', op, ['abc'], [], metaDataC)
      expect(exp).toEqual({
        attributeNames: { '#myChars': 'myChars' },
        attributeValues: { ':myChars': { SS: ['a', 'b', 'c'] } },
        statement: '#myChars :myChars',
        type: 'ADD',
      })
    })

    it('should throw when not number or a set value', () => {
      expect(() => buildUpdateExpression('age', op, ['notANumber'], [], metaDataS)).toThrow()
    })

    it('should throw when no value for attributeValue was given', () => {
      expect(() => buildUpdateExpression('age', op, [], [], metaDataS)).toThrow()
    })
  })

  describe('removeFromSet', () => {
    const op = new UpdateActionDef('DELETE', 'removeFromSet')

    it('should build the expression', () => {
      const exp = buildUpdateExpression('topics', op, [['val1', 'val2']], [], metaDataU)
      expect(exp).toEqual({
        attributeNames: { '#topics': 'topics' },
        attributeValues: { ':topics': { SS: ['val1', 'val2'] } },
        statement: '#topics :topics',
        type: 'DELETE',
      })
    })

    it('should throw when not a set value', () => {
      expect(() => buildUpdateExpression('topics', op, ['notASet'], [], metaDataU)).toThrow()
    })

    it('should throw when no value was given', () => {
      expect(() => buildUpdateExpression('topics', op, [], [], metaDataU)).toThrow()
    })
  })
})
