import { Moment } from '../decorator/moment.type'
import { Binary } from '../decorator/binary.type'

export class NullType {}

export class UndefinedType {}

export type AttributeModelType = String | Number | Boolean | Binary | Date | Moment | Set<any> | Map<any, any> | Array<any> | NullType | UndefinedType | Object

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
