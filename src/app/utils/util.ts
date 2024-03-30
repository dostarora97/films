import { Observable, of, switchMap, take } from 'rxjs';
import { Comparator, FilmSort, OMDBResponse } from '../models';

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

function compoundComparator<T>(comparators: Comparator<T>[]): Comparator<T> {
  return (a, b) =>
    comparators.reduce((result, comparator) =>
      result == 0 ? comparator(a, b) : result, 0
    );
}

export const stringComparator: Comparator<string> = (a: string, b: string) =>
  a.localeCompare(b);

export const numberComparator: Comparator<number> = (a: number, b: number) => a - b;

export function objectPropertyComparator<ObjectType, PropertyName extends keyof ObjectType = keyof ObjectType>(
  propertyName: PropertyName,
  comparator: Comparator<ObjectType[PropertyName]>
): Comparator<ObjectType> {
  return (a: ObjectType, b: ObjectType) => comparator(a[propertyName], b[propertyName]);
}

export const filmNameComparator =
  objectPropertyComparator<OMDBResponse, 'Title'>('Title', stringComparator);

export const filmYearComparator =
  objectPropertyComparator<OMDBResponse, 'Year'>('Year', numberComparator);

export const filmImdbRatingComparator =
  objectPropertyComparator<OMDBResponse, 'imdbRating'>('imdbRating', numberComparator);

export const FilmComparator: Record<FilmSort, Comparator<OMDBResponse>> = {
  [FilmSort.NAME]: filmNameComparator,
  [FilmSort.YEAR_RELEASED]: filmYearComparator,
  [FilmSort.IMDB_RATING]: filmImdbRatingComparator
}

export function difference<T>(superArray: T[], subArray: T[]): T[] {
  const subSet = new Set(subArray);
  return superArray.filter(element => !subSet.has(element));
}
