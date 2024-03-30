import { BehaviorSubject, Observable } from 'rxjs';
import { StorageService } from '../models';

export abstract class AbstractReactiveStateStorageService<State> {
  public readonly state$: Observable<State>;

  private readonly storageService: StorageService;

  private readonly stateSubject: BehaviorSubject<State>;

  protected constructor(
    private nameSpacedStorageService: StorageService
  ) {
    this.storageService = nameSpacedStorageService;
    this.stateSubject = new BehaviorSubject<State>(this.initState());
    this.state$ = this.stateSubject.asObservable();
  }

  public get state(): State {
    return this.stateSubject.getValue();
  }

  public set state(state: State) {
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
