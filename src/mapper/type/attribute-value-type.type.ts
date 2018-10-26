import { Binary } from './binary.type'
import { MomentType } from './moment.type'
import { NullType } from './null.type'
import { UndefinedType } from './undefined.type'

export type AttributeValueType =
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
