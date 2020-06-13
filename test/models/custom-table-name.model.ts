/* eslint-disable @typescript-eslint/no-extraneous-class */
import { Model } from '../../src/dynamo-easy'

@Model({ tableName: 'myCustomName' })
export class CustomTableNameModel {}
