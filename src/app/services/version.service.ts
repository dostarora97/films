import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, shareReplay, tap } from 'rxjs';
import { Optional, VersionInfo } from '../models';

@Injectable({
  providedIn: 'root',
})
export class VersionService {
  private readonly httpClient = inject(HttpClient);
  private versionUrl = 'assets/version.json';
  private cachedVersionInfo: Optional<VersionInfo> = undefined

  public fetchVersionInfo(options: {preferCached: boolean} = {preferCached: true}): Observable<VersionInfo> {
    const getVersionInfo$ = (): Observable<VersionInfo> => {
      if (options.preferCached && this.cachedVersionInfo) {
        return of(this.cachedVersionInfo);
      }
      return this.httpClient.get<VersionInfo>(this.versionUrl)
        .pipe(
          tap(versionInfo => this.cachedVersionInfo = versionInfo)
        );
    };
    return getVersionInfo$()
      .pipe(
        shareReplay({
          bufferSize: 1,
          refCount: false
        })
      );
  }

  public fetchVersionCode(options: {preferCached: boolean} = {preferCached: true}): Observable<string> {
    return this.fetchVersionInfo(options)
      .pipe(
        map(this.buildVersionCode)
      );
  }

  public getCachedVersionInfo(): Optional<VersionInfo> {
    return this.cachedVersionInfo;
  }

  public getCachedVersionCode(): Optional<string> {
    const cachedVersionInfo = this.getCachedVersionInfo();
    if (cachedVersionInfo) {
      return this.buildVersionCode(cachedVersionInfo)
    }
    return undefined;
  }

  private buildVersionCode(versionInfo: VersionInfo): string {
    return `[${versionInfo.hash.slice(0, 6)}]-[${versionInfo.timestamp}]`;
  }
}
