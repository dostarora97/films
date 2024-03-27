import { Observable } from 'rxjs';

export interface OMDBResponse {
  "Title": string,
  Year: string,
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
  imdbRating: string,
  imdbVotes: string,
  imdbID: string,
  Type: string,
  DVD: string,
  BoxOffice: string,
  Production: string,
  Website: string,
  Response: string
}

export interface MovieInfo {
  name: string,
  poster: Observable<string>
}