type Listener<T> = (payload: T) => void;

export interface ISignal<T> {
  on(fn: Listener<T>): void;
  off(fn: Listener<T>): void;
}

export class Signal<T = void> implements ISignal<T> {
  private listeners = new Set<Listener<T>>();

  on(fn: Listener<T>) {
    this.listeners.add(fn);
  }

  off(fn: Listener<T>) {
    this.listeners.delete(fn);
  }

  emit(payload: T) {
    for (const fn of this.listeners) fn(payload);
  }

  asPublic(): ISignal<T> {
    return this;
  }
}