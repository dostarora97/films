import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private static readonly NAMESPACE = 'fl';

  protected getNamespaceKey(key: string): string {
    return `${StorageService.NAMESPACE}.${key}`;
  }

  public getItem(key: string): string | null {
    return localStorage.getItem(this.getNamespaceKey(key));
  }

  public setItem(key: string, value: string): void {
    localStorage.setItem(this.getNamespaceKey(key), value);
  }
}
