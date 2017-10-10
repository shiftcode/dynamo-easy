import moment from 'moment-es6'
import { MomentMapper } from './moment.mapper'
import { NullMapper } from './null.mapper'
import { NumberMapper } from './number.mapper'
import { ObjectMapper } from './object.mapper'

describe('object mapper', () => {
  let mapper: ObjectMapper<any>

  beforeEach(() => {
    mapper = new ObjectMapper()
  })

  describe('to db', () => {
    it('should work', () => {
      const attributeValue = mapper.toDb({ name: 'name', age: 45, active: true })
      expect(attributeValue).toEqual({ M: { name: { S: 'name' }, age: { N: '45' }, active: { BOOL: true } } })
    })
  })

  describe('from db', () => {
    it('should work', () => {
      const objectValue: any = mapper.fromDb({ M: { name: { S: 'name' }, age: { N: '45' }, active: { BOOL: true } } })
      expect(objectValue).toEqual({ name: 'name', age: 45, active: true })
    })
  })
})
