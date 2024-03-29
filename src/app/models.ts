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
