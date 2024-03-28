import { Component, inject } from '@angular/core';
import { FILMS } from './data/data';
import { tablize, useOrFallback } from './utils/util';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { map, Observable, shareReplay, tap } from 'rxjs';
import { FilmInfo, OMDBResponse } from './models';
import { AsyncPipe, NgOptimizedImage } from '@angular/common';
import { CachedFilmInfoService } from './services/cached-film-info.service';
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
  private readonly cachedFilmInfoService = inject(CachedFilmInfoService);
  private readonly platform = inject(Platform);
  private readonly API_KEY = 'a529ee3e';
  private readonly allFilms = FILMS;
  private readonly colNum = (this.platform.IOS || this.platform.ANDROID) ? 1 : 4;
  private readonly films = Array.from<string, FilmInfo>(
    this.allFilms, (filmName => ({
      name: filmName,
      omdbInfo: this.getFilmInfo(filmName)
  })));

  protected readonly tables: FilmInfo[][] = tablize<FilmInfo>(this.films, this.colNum);

  private getFilmInfo(filmName: string): Observable<OMDBResponse> {
    const cachedFilmInfo$ = this.getCachedFilmInfo(filmName);
    const fetchedFilmInfo$ = this.fetchFilmInfo(filmName);
    return (useOrFallback(cachedFilmInfo$,
      (filmInfo => Boolean(filmInfo)),
      fetchedFilmInfo$
    ) as Observable<OMDBResponse>)
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: true
        })
      );
  }

  private fetchFilmInfo(filmName: string): Observable<OMDBResponse> {
    const filmNameSansYear = this.getFilmNameSansYear(filmName);
    const url = `https://www.omdbapi.com/?apikey=${this.API_KEY}&t=${filmNameSansYear}`;
    return this.httpClient.get<OMDBResponse>(url)
      .pipe(
        tap(filmInfo => {
          if (filmInfo.Response === "True") {
            this.cachedFilmInfoService.state = this.cachedFilmInfoService.state.set(filmName, filmInfo);
          }
        })
      );
  }

  private getCachedFilmInfo(filmName: string): Observable<OMDBResponse | undefined> {
    return this.cachedFilmInfoService.state$
      .pipe(
        map(filmInfoCache => filmInfoCache.get(filmName))
      );
  }

  private getFilmNameSansYear(filmName: string): string {
    return filmName.slice(0, -6);
  }
}
