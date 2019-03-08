// tslint:disable:max-classes-per-file
import { CollectionProperty, DateProperty, Model, PartitionKey, Property } from '../../src/dynamo-easy'
import { FormId, formIdMapper } from './real-world'

@Model({ tableName: 'BrutalistModelLevel4' })
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

@Model({ tableName: 'BrutalistModelLevel3' })
export class BrutalistModelLevel3 {
  @CollectionProperty({
    itemType: BrutalistModelLevel4,
    name: 'level3_list',
    sorted: true,
  })
  level3Prop: Set<BrutalistModelLevel4>
}

@Model({ tableName: 'BrutalistModelLevel2' })
export class BrutalistModelLevel2 {
  @CollectionProperty({
    itemType: BrutalistModelLevel3,
    name: 'level2_list',
  })
  level2Prop: BrutalistModelLevel3[]
}

@Model({ tableName: 'BrutalistModel' })
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
