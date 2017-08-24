import { Binary } from '../decorator/binary.type'
import { BlaType } from '../decorator/bla.type'
import { NullType } from './null.type'
import { UndefinedType } from './undefined.type'

export type AttributeModelType =
  | string
  | number
  | boolean
  | Binary
  | Date
  | BlaType
  | Set<any>
  | Map<any, any>
  | any[]
  | NullType
  | UndefinedType
  | object

// export type AttributeModelTypeName =
//   | 'String'
//   | 'Number'
//   | 'Boolean'
//   | 'Binary'
//   | 'Date'
//   | 'Moment'
//   | 'Set'
//   | 'Map'
//   | 'Array'
//   | 'Null'
//   | 'Undefined'
//   | 'Object'
//   | string;
