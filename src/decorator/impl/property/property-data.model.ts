import { MapperForType } from '../../../mapper'

export interface PropertyData {
  // the name of property how it is named in dynamoDB
  name: string
  mapper: MapperForType<any, any>
}
