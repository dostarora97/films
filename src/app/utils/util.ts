import { Observable, of, switchMap, take } from 'rxjs';

export function tablize<T>(arr: T[], c: number): T[][] {
  return tablizeHelper(arr, c, []);
}

function tablizeHelper<T>(arr: T[], c: number, acc: T[][]): T[][] {
  if (arr.length === 0) {
    return acc;
  }

  const innerArr: T[] = arr.slice(0, c);
  const remainingArr: T[] = arr.slice(c);

  return tablizeHelper(remainingArr, c, [...acc, innerArr]);
}

export function useOrFallback<T>(
  toBeUsed: Observable<T>,
  useWhenPredicate: (value: T) => boolean,
  fallback: Observable<T>
): Observable<T> {
  return toBeUsed
    .pipe(
      take(1),
      switchMap(value => {
        if (useWhenPredicate(value)) {
          return of(value);
        } else {
          return fallback;
        }
      }),
      take(1)
    )
}
