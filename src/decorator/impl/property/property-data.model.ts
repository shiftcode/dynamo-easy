import { MapperForType } from '../../../mapper/for-type/base.mapper'

export interface PropertyData {
  // the name of property how it is named in dynamoDB
  name: string
  mapper: MapperForType<any, any>
}
