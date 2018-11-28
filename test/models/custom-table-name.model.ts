// tslint:disable:no-unnecessary-class

import { Model } from '../../src/dynamo-easy'

@Model({ tableName: 'myCustomName' })
export class CustomTableNameModel {}
