import { inject, Injectable } from '@angular/core';
import { VersionService } from './version.service';
import { NamespaceAwareStorageService } from '../models';
import { difference } from '../utils/util';

@Injectable({
  providedIn: 'root'
})
export class BuildAwareNamespacedStorageService extends NamespaceAwareStorageService {
  private static readonly NAMESPACE = 'fl';
  private readonly versionService: VersionService = inject(VersionService);
  private storagePrefix: string | undefined;

  public override getItem(key: string): string | null {
    return localStorage.getItem(this.buildNamespaceStorageKey(key));
  }

  public override setItem(key: string, value: string): void {
    localStorage.setItem(this.buildNamespaceStorageKey(key), value);
  }

  public override removeItem(key: string): void {
    console.log(+Date.now(), 'BuildAwareNamespacedStorageService', 'removing', key);
    localStorage.removeItem(this.buildNamespaceStorageKey(key));
  }

  public override removeAllItems(): void {
    this.getNameSpaceStorageKeys()
      .forEach(key => this.removeItem(key));
  }

  protected override buildNamespaceStorageKey(key: string): string {
    return `${this.getNameSpacePrefixKey()}.${key}`;
  }

  protected override getNameSpaceStorageKeys(): string[] {
    const nameSpacePrefix = this.getNameSpacePrefixKey();
    return this.getAllStorageKeys()
      .filter(key => key.startsWith(nameSpacePrefix))
  }

  protected override getAllStorageKeys(): string[] {
    return Array.from({length: localStorage.length}, (_, i) =>
      localStorage.key(i) as string);
  }

  public override removeAllNameSpaceAwareItems(): void {
    this.getNameSpaceStorageKeys()
      .forEach(key => this.removeItem(key));
  }
  public override removeAllOtherNameSpaceAwareItems(): void {
    difference(this.getAllStorageKeys(), this.getNameSpaceStorageKeys())
      .forEach(key => this.removeItem(key));
  }

  private getNameSpacePrefixKey(): string {
    if (this.storagePrefix) {
      return this.storagePrefix
    } else {
      this.storagePrefix = this.buildNameSpacePrefix();
      return this.storagePrefix;
    }
  }

  private buildNameSpacePrefix(): string {
    return `${BuildAwareNamespacedStorageService.NAMESPACE}-${this.versionService.getCachedVersionCode() || ''}`;
  }
}
