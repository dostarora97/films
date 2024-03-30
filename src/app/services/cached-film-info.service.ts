import { Injectable } from '@angular/core';
import { AbstractReactiveStateStorageService } from './abstract-reactive-state-storage.service';
import { OMDBResponse } from '../models';
import { BuildAwareNamespacedStorageService } from './build-aware-namespaced-storage.service';

@Injectable({
  providedIn: 'root'
})
export class CachedFilmInfoService
  extends AbstractReactiveStateStorageService<Map<string, OMDBResponse>> {
  protected static readonly EMPTY_CACHE: Map<string, OMDBResponse> = new Map();
  protected static readonly CACHE_KEY = 'film-info';

  constructor(
    storageService: BuildAwareNamespacedStorageService
  ) {
    super(storageService);
  }

  protected defaultState(): Map<string, OMDBResponse> {
    return CachedFilmInfoService.EMPTY_CACHE;
  }

  protected persistedStateKey(): string {
    return `${CachedFilmInfoService.CACHE_KEY}`;
  }

  protected override serialize(stateObj: Map<string, OMDBResponse>): string {
    const entries: [string, OMDBResponse][] = Array.from(stateObj.entries());
    return JSON.stringify(entries);
  }

  protected override deserialize(stateStr: string): Map<string, OMDBResponse> {
    const entries: [string, OMDBResponse][] = JSON.parse(stateStr);
    return new Map(entries);
  }
}
