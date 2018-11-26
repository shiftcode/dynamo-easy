// tslint:disable:max-classes-per-file
import { SortKey } from '../../src/decorator'
import { CustomMapper, Model, PartitionKey } from '../../src/decorator/impl'
import { MapperForType, NumberAttribute } from '../../src/mapper'

export class CustomId {
  private static MULTIPLIER_E = 5

  date: Date

  id: number

  static parse(value: string): CustomId {
    const id = parseInt(value.substr(0, value.length - CustomId.MULTIPLIER_E), 10)
    const date = value.substr(value.length - CustomId.MULTIPLIER_E)

    const y = date.toString().substr(0, 4)
    const m = date.toString().substr(4, 2)
    const d = date.toString().substr(6, 2)

    return new CustomId(new Date(`${y}-${m}-${d}`), id)
  }

  static unparse(customId: CustomId): string {
    const yyyy = customId.date.getFullYear()
    const mm = (<any>(customId.date.getMonth() + 1).toString()).padStart(2, '0')
    const dd = (<any>customId.date.getDate().toString()).padStart(2, '0')
    return `${yyyy}${mm}${dd}${(<any>customId.id.toString()).padStart(CustomId.MULTIPLIER_E, '0')}`
  }

  constructor(date: Date, id: number) {
    this.date = date
    this.id = id
  }
}

export const CustomIdMapper: MapperForType<CustomId, NumberAttribute> = {
  fromDb: (attributeValue: NumberAttribute) => CustomId.parse(attributeValue.N),
  toDb: (propertyValue: CustomId) => ({ N: CustomId.unparse(propertyValue) }),
}

@Model()
export class ModelWithCustomMapperForSortKeyModel {
  @PartitionKey()
  name: string

  @CustomMapper(CustomIdMapper)
  @SortKey()
  customId: CustomId

  constructor(name: string, id: CustomId) {
    this.name = name
    this.customId = id
  }
}
