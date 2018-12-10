import * as DynamoDB from 'aws-sdk/clients/dynamodb'
import { Omit } from '../../../model/omit.type'

export type TransactGetResponse<T> = Omit<DynamoDB.TransactGetItemsOutput, 'Responses'> & { Items: T[] }
