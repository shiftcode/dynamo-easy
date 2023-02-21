/**
 * @module multi-model-requests/transact-get
 */
import * as DynamoDB from '@aws-sdk/client-dynamodb'
import { ModelConstructor } from '../../model/model-constructor'
import { TransactGetFullResponse } from './transact-get-full.response'

export interface TransactGetRequestBase {
  readonly params: DynamoDB.TransactGetItemsInput
  execNoMap(): Promise<DynamoDB.TransactGetItemsOutput>
}

export interface TransactGetRequest1<A> extends TransactGetRequestBase {
  forModel<B>(modelClazz: ModelConstructor<B>, key: Partial<B>): TransactGetRequest2<A, B>

  execFullResponse(): Promise<TransactGetFullResponse<[A]>>

  exec(): Promise<[A]>
}

export interface TransactGetRequest2<A, B> extends TransactGetRequestBase {
  forModel<C>(modelClazz: ModelConstructor<C>, key: Partial<C>): TransactGetRequest3<A, B, C>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B]>>

  exec(): Promise<[A, B]>
}

export interface TransactGetRequest3<A, B, C> extends TransactGetRequestBase {
  forModel<D>(modelClazz: ModelConstructor<D>, key: Partial<D>): TransactGetRequest4<A, B, C, D>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C]>>

  exec(): Promise<[A, B, C]>
}

export interface TransactGetRequest4<A, B, C, D> extends TransactGetRequestBase {
  forModel<E>(modelClazz: ModelConstructor<E>, key: Partial<E>): TransactGetRequest5<A, B, C, D, E>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D]>>

  exec(): Promise<[A, B, C, D]>
}

export interface TransactGetRequest5<A, B, C, D, E> extends TransactGetRequestBase {
  forModel<F>(modelClazz: ModelConstructor<F>, key: Partial<F>): TransactGetRequest6<A, B, C, D, E, F>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E]>>

  exec(): Promise<[A, B, C, D, E]>
}

export interface TransactGetRequest6<A, B, C, D, E, F> extends TransactGetRequestBase {
  forModel<G>(modelClazz: ModelConstructor<G>, key: Partial<G>): TransactGetRequest7<A, B, C, D, E, F, G>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E, F]>>

  exec(): Promise<[A, B, C, D, E, F]>
}

export interface TransactGetRequest7<A, B, C, D, E, F, G> extends TransactGetRequestBase {
  forModel<H>(modelClazz: ModelConstructor<H>, key: Partial<H>): TransactGetRequest8<A, B, C, D, E, F, G, H>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E, F, G]>>

  exec(): Promise<[A, B, C, D, E, F, G]>
}

export interface TransactGetRequest8<A, B, C, D, E, F, G, H> extends TransactGetRequestBase {
  forModel<I>(modelClazz: ModelConstructor<I>, key: Partial<I>): TransactGetRequest9<A, B, C, D, E, F, G, H, I>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E, F, G, H]>>

  exec(): Promise<[A, B, C, D, E, F, G, H]>
}

export interface TransactGetRequest9<A, B, C, D, E, F, G, H, I> extends TransactGetRequestBase {
  forModel<J>(modelClazz: ModelConstructor<J>, key: Partial<J>): TransactGetRequest10<A, B, C, D, E, F, G, H, I, J>

  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E, F, G, H, I]>>

  exec(): Promise<[A, B, C, D, E, F, G, H, I]>
}

export interface TransactGetRequest10<A, B, C, D, E, F, G, H, I, J> extends TransactGetRequestBase {
  execFullResponse(): Promise<TransactGetFullResponse<[A, B, C, D, E, F, G, H, I, J]>>

  exec(): Promise<[A, B, C, D, E, F, G, H, I, J]>
}
