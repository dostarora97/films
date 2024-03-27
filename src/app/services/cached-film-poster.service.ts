import { Injectable } from '@angular/core';
import { AbstractReactiveStateStorageService } from './abstract-reactive-state-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CachedFilmPosterService
  extends AbstractReactiveStateStorageService<Map<string, string>> {
  protected static readonly EMPTY_CACHE: Map<string, string> = new Map();
  protected static readonly CACHE_KEY = 'film-poster';

  constructor() {
    super();
  }

  protected defaultState(): Map<string, string> {
    return CachedFilmPosterService.EMPTY_CACHE;
  }

  protected persistedStateKey(): string {
    return CachedFilmPosterService.CACHE_KEY;
  }

  protected override serialize(stateObj: Map<string, string>): string {
    const entries: [string, string][] = Array.from(stateObj.entries());
    return JSON.stringify(entries);
  }

  protected override deserialize(stateStr: string): Map<string, string> {
    const entries: [string, string][] = JSON.parse(stateStr);
    return new Map(entries);
  }
}
