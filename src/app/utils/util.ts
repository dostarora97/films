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

export function useOrFallback<Use, Fallback = Use>(
  toBeUsed: Observable<Use>,
  useWhenPredicate: (value: Use) => boolean,
  fallback: Observable<Fallback>
): Observable<Use|Fallback> {
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
