import { BehaviorSubject, Observable, shareReplay, tap } from 'rxjs';
import { StorageService } from '../models';

export abstract class AbstractReactiveStateStorageService<State> {
  private readonly _state$: Observable<State>;

  private readonly storageService: StorageService;

  private readonly stateSubject: BehaviorSubject<State>;

  protected constructor(
    nameSpacedStorageService: StorageService
  ) {
    this.storageService = nameSpacedStorageService;
    this.stateSubject = new BehaviorSubject<State>(this.initState());
    this._state$ = this.stateSubject.asObservable()
      .pipe(
        tap((state: State) => {
          console.log(+Date.now(), 'AbstractReactiveStateStorageService state change before shareReplay', state);
        }),
        shareReplay({
          bufferSize: 1,
          refCount: false
        }),
        tap((state: State) => {
          console.log(+Date.now(), 'AbstractReactiveStateStorageService state change after shareReplay', state);
        })
      );
  }

  public get state$(): Observable<State> {
    console.log(+Date.now(), 'AbstractReactiveStateStorageService get state$');
    return this._state$;
  }

  public get state(): State {
    return this.stateSubject.getValue();
  }

  public set state(state: State) {
    console.log(+Date.now(), 'AbstractReactiveStateStorageService set state', state);
    const isStatePersisted: boolean = this.persistState(state);
    if (isStatePersisted) {
      this.stateSubject.next(state);
    }
  }

  protected abstract defaultState(): State;

  protected abstract persistedStateKey(): string;


  protected serialize(stateObj: State): string {
    return JSON.stringify(stateObj);
  }

  protected deserialize(stateStr: string): State {
    return JSON.parse(stateStr);
  }

  private initState(): State {
    const cachedState: State | null = this.retrieveState();
    if (Boolean(cachedState)) {
      return cachedState as State;
    } else {
      this.persistState(this.defaultState());
      return this.defaultState();
    }
  }

  private persistState(state: State): boolean {
    try {
      const stateJSON: string = this.serialize(state);
      this.storageService.setItem(this.persistedStateKey(), stateJSON);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  }

  private retrieveState(): State | null {
    try {
      const stateJSON: string | null = this.storageService.getItem(this.persistedStateKey());
      return stateJSON ? this.deserialize(stateJSON) as State : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  }
}
