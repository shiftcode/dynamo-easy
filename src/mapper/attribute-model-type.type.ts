import { Binary } from '../decorator/binary.type'
import { Moment } from '../decorator/moment.type'

export class NullType {}

export class UndefinedType {}

export type AttributeModelType =
  | String
  | Number
  | Boolean
  | Binary
  | Date
  | Moment
  | Set<any>
  | Map<any, any>
  | any[]
  | NullType
  | UndefinedType
  | Object

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
