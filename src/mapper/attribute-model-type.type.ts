import { Binary } from '../decorator/binary.type'
import { MomentType } from '../decorator/moment.type'
import { NullType } from './null.type'
import { UndefinedType } from './undefined.type'

export type AttributeModelType =
  | string
  | number
  | boolean
  | Binary
  | Date
  | MomentType
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
