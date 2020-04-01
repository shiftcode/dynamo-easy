// copied from just-curry-it

interface CurriedFunction1<T1, R> {
  (): CurriedFunction1<T1, R>

  (t1: T1): R
}

interface CurriedFunction2<T1, T2, R> {
  (): CurriedFunction2<T1, T2, R>

  (t1: T1): CurriedFunction1<T2, R>

  (t1: T1, t2: T2): R
}

interface CurriedFunction3<T1, T2, T3, R> {
  (): CurriedFunction3<T1, T2, T3, R>

  (t1: T1): CurriedFunction2<T2, T3, R>

  (t1: T1, t2: T2): CurriedFunction1<T3, R>

  (t1: T1, t2: T2, t3: T3): R
}

interface CurriedFunction4<T1, T2, T3, T4, R> {
  (): CurriedFunction4<T1, T2, T3, T4, R>

  (t1: T1): CurriedFunction3<T2, T3, T4, R>

  (t1: T1, t2: T2): CurriedFunction2<T3, T4, R>

  (t1: T1, t2: T2, t3: T3): CurriedFunction1<T4, R>

  (t1: T1, t2: T2, t3: T3, t4: T4): R
}

interface CurriedFunction5<T1, T2, T3, T4, T5, R> {
  (): CurriedFunction5<T1, T2, T3, T4, T5, R>

  (t1: T1): CurriedFunction4<T2, T3, T4, T5, R>

  (t1: T1, t2: T2): CurriedFunction3<T3, T4, T5, R>

  (t1: T1, t2: T2, t3: T3): CurriedFunction2<T4, T5, R>

  (t1: T1, t2: T2, t3: T3, t4: T4): CurriedFunction1<T5, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): R
}

interface CurriedFunction6<T1, T2, T3, T4, T5, T6, R> {
  (): CurriedFunction6<T1, T2, T3, T4, T5, T6, R>

  (t1: T1): CurriedFunction5<T2, T3, T4, T5, T6, R>

  (t1: T1, t2: T2): CurriedFunction4<T3, T4, T5, T6, R>

  (t1: T1, t2: T2, t3: T3): CurriedFunction3<T4, T5, T6, R>

  (t1: T1, t2: T2, t3: T3, t4: T4): CurriedFunction2<T5, T6, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): CurriedFunction1<T6, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): R
}

interface CurriedFunction7<T1, T2, T3, T4, T5, T6, T7, R> {
  (): CurriedFunction7<T1, T2, T3, T4, T5, T6, T7, R>

  (t1: T1): CurriedFunction6<T2, T3, T4, T5, T6, T7, R>

  (t1: T1, t2: T2): CurriedFunction5<T3, T4, T5, T6, T7, R>

  (t1: T1, t2: T2, t3: T3): CurriedFunction4<T4, T5, T6, T7, R>

  (t1: T1, t2: T2, t3: T3, t4: T4): CurriedFunction3<T5, T6, T7, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): CurriedFunction2<T6, T7, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): CurriedFunction1<T7, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7): R
}

interface CurriedFunction8<T1, T2, T3, T4, T5, T6, T7, T8, R> {
  (): CurriedFunction8<T1, T2, T3, T4, T5, T6, T7, T8, R>

  (t1: T1): CurriedFunction7<T2, T3, T4, T5, T6, T7, T8, R>

  (t1: T1, t2: T2): CurriedFunction6<T3, T4, T5, T6, T7, T8, R>

  (t1: T1, t2: T2, t3: T3): CurriedFunction5<T4, T5, T6, T7, T8, R>

  (t1: T1, t2: T2, t3: T3, t4: T4): CurriedFunction4<T5, T6, T7, T8, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5): CurriedFunction3<T6, T7, T8, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6): CurriedFunction2<T7, T8, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7): CurriedFunction1<T8, R>

  (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7, t8: T8): R
}

/**
 * Creates a function that accepts one or more arguments of func that when called either invokes func returning
 * its result, if all func arguments have been provided, or returns a function that accepts one or more of the
 * remaining func arguments, and so on. The arity of func may be specified if func.length is not sufficient.
 * @param func The function to curry.
 * @param arity The arity of func.
 * @return Returns the new curried function.
 */
export function curry<T1, R>(func: (t1: T1) => R, arity?: number): CurriedFunction1<T1, R>
export function curry<T1, T2, R>(func: (t1: T1, t2: T2) => R, arity?: number): CurriedFunction2<T1, T2, R>
export function curry<T1, T2, T3, R>(
  func: (t1: T1, t2: T2, t3: T3) => R,
  arity?: number,
): CurriedFunction3<T1, T2, T3, R>
export function curry<T1, T2, T3, T4, R>(
  func: (t1: T1, t2: T2, t3: T3, t4: T4) => R,
  arity?: number,
): CurriedFunction4<T1, T2, T3, T4, R>
export function curry<T1, T2, T3, T4, T5, R>(
  func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5) => R,
  arity?: number,
): CurriedFunction5<T1, T2, T3, T4, T5, R>
export function curry<T1, T2, T3, T4, T5, T6, R>(
  func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6) => R,
  arity?: number,
): CurriedFunction6<T1, T2, T3, T4, T5, T6, R>
export function curry<T1, T2, T3, T4, T5, T6, T7, R>(
  func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7) => R,
  arity?: number,
): CurriedFunction7<T1, T2, T3, T4, T5, T6, T7, R>
export function curry<T1, T2, T3, T4, T5, T6, T7, T8, R>(
  func: (t1: T1, t2: T2, t3: T3, t4: T4, t5: T5, t6: T6, t7: T7, t8: T8) => R,
  arity?: number,
): CurriedFunction8<T1, T2, T3, T4, T5, T6, T7, T8, R>
export function curry(fn: (...args: any[]) => any, arity?: number) {
  return function curried() {
    if (arity == null) {
      arity = fn.length
    }
    const args = [].slice.call(arguments)
    if (args.length >= arity) {
      // @ts-ignore
      return fn.apply(this, args)
    } else {
      return function () {
        // @ts-ignore
        return curried.apply(this, args.concat([].slice.call(arguments)))
      }
    }
  }
}
