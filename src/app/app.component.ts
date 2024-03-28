import { Component, inject } from '@angular/core';
import { MOVIES } from './data/data';
import { tablize, useOrFallback } from './utils/util';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { MovieInfo, OMDBResponse } from './models';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { CachedFilmPosterService } from './services/cached-film-poster.service';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ AsyncPipe, HttpClientModule, NgOptimizedImage ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly posterCacheService = inject(CachedFilmPosterService);
  private readonly platform = inject(Platform);
  private readonly API_KEY = 'a529ee3e';
  private readonly allMovies = MOVIES;
  private readonly colNum = (this.platform.IOS || this.platform.ANDROID) ? 1 : 4;

  protected readonly movies = Array.from<string, MovieInfo>(
    this.allMovies, (movieName => ({
      name: movieName,
      poster: this.getMoviePosterUrl(movieName)
  })));
  protected readonly tables: MovieInfo[][] = tablize<MovieInfo>(this.movies, this.colNum);

  protected getMoviePosterUrl(movieName: string): Observable<string> {
    const cachedPoster$ = this.getCachedPoster(movieName);
    const fetchedPoster$ = this.fetchPosterUrl(movieName);
    return useOrFallback(cachedPoster$, (poster => poster.length > 0), fetchedPoster$);
  }

  private fetchPosterUrl(movieName: string): Observable<string> {
    const movieNameSansYear = this.getMovieNameSansYear(movieName);
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&t=${movieNameSansYear}`;
    return this.httpClient.get<OMDBResponse>(url)
      .pipe(
        map(data => {
          if (data.Response === "True") {
            return data.Poster;
          } else {
            return '';
          }
        }),
        catchError(err => of<string>('')),
        tap(posterUrl => {
          if (posterUrl.length > 0) {
            this.posterCacheService.state = this.posterCacheService.state.set(movieName, posterUrl);
          }
        })
      );
  }

  private getCachedPoster(movieName: string): Observable<string> {
    return this.posterCacheService.state$
      .pipe(
        map(posterCache => posterCache.get(movieName) ?? '')
      );
  }

  private getMovieNameSansYear(movieName: string): string {
    return movieName.slice(0, -6);
  }
}
