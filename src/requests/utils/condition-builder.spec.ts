import { ConditionBuilder } from './condition-builder'

describe('condition builder', () => {
  describe('simple conditions', () => {
    it('equal', () => {
      const condition = ConditionBuilder.build('id').equals('value')
      expect(condition.statement).toBe('#id = :id')

      expect(condition.attributeNames).toBeDefined()
      expect(Object.keys(condition.attributeNames)[0]).toBe('#id')
      expect(condition.attributeNames['#id']).toBe('id')

      expect(condition.attributeMap).toBeDefined()
      expect(Object.keys(condition.attributeMap)[0]).toBe(':id')
      expect(condition.attributeMap[':id']).toEqual({ S: 'value' })
    })
  })

  describe('complex conditions', () => {
    // CondChain.and(
    //   ConditionBuilder.build('id').beginsWith('bla')
    // )
    //
    // QB.not(
    //   QB.where('id').equals('idValue'),
    //   QB.where('bla').contains('ha')
    // )
  })
})
