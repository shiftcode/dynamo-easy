// tslint:disable:max-classes-per-file
import { DateProperty, Model, PartitionKey, Property } from '../../src/decorator/impl'
import { CollectionProperty } from '../../src/decorator/impl/collection/collection-property.decorator'
import { FormId, formIdMapper } from './real-world'

@Model()
export class BrutalistModelLevel4 {
  @DateProperty({ name: 'level4_date' })
  level4Date: Date

  @Property({ name: 'level4_string' })
  level4String: string

  level4Number: number

  @Property({ mapper: formIdMapper })
  level4FormId: FormId

  @CollectionProperty({ itemMapper: formIdMapper, name: 'level4_set' })
  level4Set: Set<FormId>
}

@Model()
export class BrutalistModelLevel3 {
  @CollectionProperty({
    itemType: BrutalistModelLevel4,
    name: 'level3_list',
    sorted: true,
  })
  level3Prop: Set<BrutalistModelLevel4>
}

@Model()
export class BrutalistModelLevel2 {
  @CollectionProperty({
    itemType: BrutalistModelLevel3,
    name: 'level2_list',
  })
  level2Prop: BrutalistModelLevel3[]
}

@Model()
export class BrutalistModel {
  @PartitionKey()
  @Property({ mapper: formIdMapper })
  id: FormId

  @CollectionProperty({
    itemType: BrutalistModelLevel2,
    name: 'level1_list',
  })
  level1Prop: BrutalistModelLevel2[]
}
