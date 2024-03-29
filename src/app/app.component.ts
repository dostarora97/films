import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  Signal,
  signal
} from '@angular/core';
import { FILMS } from './data/data';
import { FilmComparator, useOrFallback } from './utils/util';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import {
  combineLatest,
  debounceTime,
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  tap
} from 'rxjs';
import { AsyncFilmInfo, Comparator, FilmInfo, FilmSort, OMDBResponse } from './models';
import { AsyncPipe } from '@angular/common';
import { CachedFilmInfoService } from './services/cached-film-info.service';
import { Platform } from '@angular/cdk/platform';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatSelectModule } from '@angular/material/select';
import { coerceNumberProperty } from '@angular/cdk/coercion';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-root',
  standalone: true,
  imports: [ AsyncPipe, HttpClientModule, FormsModule, MatFormFieldModule, MatInputModule, MatGridListModule, MatSelectModule ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  private readonly httpClient = inject(HttpClient);
  private readonly cachedFilmInfoService = inject(CachedFilmInfoService);
  private readonly platform = inject(Platform);

  private readonly API_KEY = 'a529ee3e';
  protected readonly colNum = (this.platform.IOS || this.platform.ANDROID) ? 1 : 4;
  private readonly infoAwareFilms = Array.from<string, AsyncFilmInfo>(
    FILMS, (filmName => ({
      name: filmName,
      omdbInfo: this.getFilmInfo(filmName)
    })));

  protected selectedFilmSort = signal(FilmSort.IMDB_RATING);
  protected selectedSortOrder = signal(-1);
  protected readonly filmSorts = Object.values(FilmSort);
  protected searchText = signal('');
  private readonly searchTextDebounced = toSignal(toObservable(this.searchText)
    .pipe(
      debounceTime(250)
    ), {
    initialValue: ''
  });

  private readonly filteredFilms = computed(() =>
    this.infoAwareFilms.filter(film =>
      film.name.toLowerCase().includes(this.searchTextDebounced().toLowerCase())
  ));

  private readonly filteredFilms$ = toObservable(this.filteredFilms);
  private readonly selectedFilmSort$ = toObservable(this.selectedFilmSort);
  private readonly selectedSortOrder$ = toObservable(this.selectedSortOrder);

  protected readonly filteredSortedFilms: Signal<FilmInfo[]> = toSignal(
    combineLatest([this.selectedFilmSort$, this.selectedSortOrder$, this.filteredFilms$])
      .pipe(
        switchMap(([selectedFilmSortValue, selectedOrder, filteredFilmsValue]) => {
          return forkJoin(
            filteredFilmsValue
              .map(filmInfo => forkJoin({
                name: of(filmInfo.name),
                omdbInfo: filmInfo.omdbInfo
              }))
          ).pipe(
            map(films => {
              const comparator: Comparator<OMDBResponse> = FilmComparator[ selectedFilmSortValue ];
              return films.sort((film1, film2) =>
                selectedOrder * comparator(film1.omdbInfo, film2.omdbInfo)
              )
            })
          )
        })
      ), {
      initialValue: []
    });

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
        map(filmInfo => ({
          ...filmInfo,
          Year: coerceNumberProperty(filmInfo.Year, 0),
          imdbRating: coerceNumberProperty(filmInfo.imdbRating, 0),
        })),
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
