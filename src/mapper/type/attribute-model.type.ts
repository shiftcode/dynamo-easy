import { MomentType } from '../../decorator/impl/date/moment.type'
import { Binary } from './binary.type'
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
