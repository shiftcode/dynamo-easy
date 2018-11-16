import { DynamoEasyConfig } from '../src/config'
import { MomentMapper } from './custom-mappers/moment.mapper'

DynamoEasyConfig.updateConfig({ dateMapper: MomentMapper })
