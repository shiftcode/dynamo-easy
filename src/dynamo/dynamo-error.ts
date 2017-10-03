import { DynamoErrorCode } from './dynamo-error-code.enum'

export interface DynamoError {
  code: DynamoErrorCode
  message: string
  requestId: string
  retryDelay: number
  retryable: boolean
  statusCode: number
}
