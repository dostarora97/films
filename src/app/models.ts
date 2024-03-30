import { Observable } from 'rxjs';

export interface OMDBResponse {
  Title: string,
  Year: number,
  Released: string,
  Runtime: string,
  Genre: string,
  Director: string,
  Rated: string,
  Actors: string,
  Plot: string,
  Writer: string,
  Language: string,
  Country: string,
  Awards: string,
  Poster: string,
  Ratings: [
    {
      Source: string,
      Value: string
    },
    {
      Source: string,
      Value: string
    },
    {
      Source: string,
      Value: string
    }
  ],
  Metascore: string,
  imdbRating: number,
  imdbVotes: string,
  imdbID: string,
  Type: string,
  DVD: string,
  BoxOffice: string,
  Production: string,
  Website: string,
  Response: string
}

export interface AsyncFilmInfo {
  name: string,
  omdbInfo: Observable<OMDBResponse>
}

export interface FilmInfo {
  name: string,
  omdbInfo: OMDBResponse
}

export enum FilmSort {
  NAME = 'Name',
  YEAR_RELEASED = 'Year released',
  IMDB_RATING = 'IMDB rating'
}

export type Comparator<T> = (a: T, b: T) => number;

export interface VersionInfo {
  hash: string,
  timestamp: string
}

export type Optional<T> = T | undefined;

export abstract class StorageService {
  public abstract getItem(key: string): string | null
  public abstract setItem(key: string, value: string): void
  public abstract removeItem(key: string): void
  public abstract removeAllItems(): void
  protected abstract getAllStorageKeys(): string[]
}

export abstract class NamespaceAwareStorageService extends StorageService {
  protected abstract getNamespace(key: string): string
  protected abstract getNameSpaceStorageKeys(): string[]
  public abstract removeAllNameSpaceAwareItems(): void
  public abstract removeAllOtherNameSpaceAwareItems(): void
}
