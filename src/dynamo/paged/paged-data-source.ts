// tslint:disable:no-console
import { Key } from 'aws-sdk/clients/dynamodb'
import { findIndex } from 'lodash'
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs'
import { finalize, map, publishReplay, refCount, share, switchMap, tap } from 'rxjs/operators'
import { QueryRequest } from '../request/query/query.request'
import { QueryResponse } from '../request/query/query.response'
import { Request } from '../request/request.model'
import { ScanRequest } from '../request/scan/scan.request'
import { ScanResponse } from '../request/scan/scan.response'
import { Pageable } from './pageable'
import { PagedRequestMeta } from './paged-request-meta'

export class PagedDataSource<
  T,
  R extends QueryRequest<T> | ScanRequest<T>,
  O extends QueryResponse<T> | ScanResponse<T>
> {
  loadingSubject: BehaviorSubject<boolean> = new BehaviorSubject(false)
  nextSubject: Subject<void> = new Subject<void>()
  metaSubject: BehaviorSubject<PagedRequestMeta> = new BehaviorSubject({ current: 0, total: 0, hasMore: false })

  data: T[] = []
  count$: Observable<number>
  loading$: Observable<boolean>
  hasMore$: Observable<boolean>

  lastKey: Key | null
  meta$: Observable<PagedRequestMeta>

  constructor(request$: Observable<Pageable<T, R, O>>, private pageSize: number = 50) {
    this.loading$ = this.loadingSubject.asObservable()
    this.meta$ = this.metaSubject.asObservable()

    request$ = request$.pipe(tap(() => this.reset()), publishReplay(1), refCount())

    const count$: Observable<number> = request$.pipe(
      tap(() => console.debug('fetch count')),
      switchMap(request =>
        request
          .limit(Request.INFINITE_LIMIT)
          .exclusiveStartKey(null)
          .execCount()
      ),
      tap(count => console.debug('got count', count)),
      share()
    )

    const data$: Observable<T[]> = combineLatest(request$, this.nextSubject).pipe(
      tap(() => console.debug('request changed or next page was requested, call for data')),
      map(values => values[0]),
      switchMap(request => this.fetchData(request)),
      tap(data => this.data.push(...data)),
      share()
    )

    combineLatest(data$, count$)
      .pipe(
        map(values => {
          console.debug('data or count changed -> hasMore', this.data.length < values[1])
          return {
            current: this.data.length,
            total: values[1],
            hasMore: this.data.length < values[1],
          }
        }),
        share()
      )
      .subscribe(meta => this.metaSubject.next(meta))

    const hasMore$: Observable<boolean> = this.meta$.pipe(
      map(meta => {
        return meta.hasMore
      }),
      share()
    )

    this.hasMore$ = hasMore$
    this.count$ = count$

    // subscribe to get it rolling
    data$.subscribe(() => console.debug('fetched data'), error => console.error('could not fetch data', error))

    // fetch the first set of data
    this.next()
  }

  next(): void {
    this.nextSubject.next()
  }

  /**
   * removes the given item if it exists in data set, and updates the counter.
   * @param item
   */
  removeItem(item: T): void {
    // FIXME remove any when https://github.com/Microsoft/TypeScript/issues/21592 is fixed
    const index: number = findIndex<any>(this.data, item)
    if (index !== -1) {
      this.data.splice(index, 1)
      const meta: PagedRequestMeta = this.metaSubject.getValue()
      meta.current--
      meta.total--
      this.metaSubject.next(meta)
    } else {
      console.warn('the given item could not be found')
    }
  }

  addItem(item: T): void {
    this.data.unshift(item)
    const meta: PagedRequestMeta = this.metaSubject.getValue()
    meta.current++
    meta.total++
    this.metaSubject.next(meta)
  }

  /**
   * will search for the item using _.findIndex(predicate) and replaces the found item with the updatedItem,
   * logs an error if the item to replace could not be found
   */
  editItem(updatedItem: T, predicate: any): void {
    const index: number = findIndex(this.data, predicate)
    if (index !== -1) {
      this.data[index] = updatedItem
    } else {
      console.error('could not find the item with predicate «%s»', predicate)
    }
  }

  private reset(): void {
    console.debug('reset')
    this.data = []
    this.lastKey = null
  }

  private fetchData(request: Pageable<T, R, O>): Observable<T[]> {
    console.debug('fetchData()')
    this.loadingSubject.next(true)

    return request
      .exclusiveStartKey(this.lastKey)
      .limit(this.pageSize)
      .execFullResponse()
      .pipe(
        tap(response => {
          console.debug(response)
          this.lastKey = response.LastEvaluatedKey === undefined ? null : response.LastEvaluatedKey
        }),
        map(response => response.Items || []),
        finalize(() => {
          console.debug('fetchData(): finally')
          this.loadingSubject.next(false)
        })
      )
  }
}
