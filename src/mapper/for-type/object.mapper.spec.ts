import { ObjectMapper } from './object.mapper'

describe('object mapper', () => {
  describe('to db', () => {
    it('should work', () => {
      const attributeValue = ObjectMapper.toDb({ name: 'name', age: 45, active: true })
      expect(attributeValue).toEqual({ M: { name: { S: 'name' }, age: { N: '45' }, active: { BOOL: true } } })
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const objectValue: any = ObjectMapper.fromDb({
        M: { name: { S: 'name' }, age: { N: '45' }, active: { BOOL: true } },
      })
      expect(objectValue).toEqual({ name: 'name', age: 45, active: true })
    })
  })
})
