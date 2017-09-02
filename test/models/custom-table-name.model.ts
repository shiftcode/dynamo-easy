import { Model } from '../../src/decorator/impl/model/model.decorator'

@Model({ tableName: 'myCustomName' })
export class CustomTableNameModel {}
