import { updateDynamoEasyConfig } from '@shiftcoders/dynamo-easy'
import { dateToNumberMapper } from '../models'

updateDynamoEasyConfig({
  dateMapper: dateToNumberMapper
})
