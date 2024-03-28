import { Component, computed, effect, inject, Signal, signal } from '@angular/core';
import { FILMS } from './data/data';
import { tablize, useOrFallback } from './utils/util';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { debounceTime, map, Observable, shareReplay, tap } from 'rxjs';
import { FilmInfo, OMDBResponse } from './models';
import { AsyncPipe } from '@angular/common';
import { CachedFilmInfoService } from './services/cached-film-info.service';
import { Platform } from '@angular/cdk/platform';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ AsyncPipe, HttpClientModule, FormsModule, MatFormFieldModule, MatInputModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly cachedFilmInfoService = inject(CachedFilmInfoService);
  private readonly platform = inject(Platform);

  private readonly API_KEY = 'a529ee3e';
  private readonly colNum = (this.platform.IOS || this.platform.ANDROID) ? 1 : 4;

  protected searchText = signal('');
  private readonly searchTextDebounced = toSignal(toObservable(this.searchText)
    .pipe(
      debounceTime(250)
    ), {
    initialValue: ''
  });
  private readonly allFilms = computed(() => FILMS.filter(film =>
    film.toLowerCase().includes(this.searchTextDebounced().toLowerCase())));
  private readonly films = computed(() => Array.from<string, FilmInfo>(
    this.allFilms(), (filmName => ({
      name: filmName,
      omdbInfo: this.getFilmInfo(filmName)
    }))));
  protected readonly filmsTable: Signal<FilmInfo[][]> = computed(() =>
    tablize<FilmInfo>(this.films(), this.colNum));

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
