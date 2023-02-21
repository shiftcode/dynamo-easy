/**
 * @module store-requests
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { Omit } from '../../../model/omit.type'

export type TransactGetResponse<T> = Omit<DynamoDB.TransactGetItemsOutput, 'Responses'> & { Items: T[] }
