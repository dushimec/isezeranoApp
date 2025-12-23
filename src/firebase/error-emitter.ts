type Listener = (payload: any) => void;

class Emitter {
  private listeners: Record<string, Listener[]> = {};

  on(event: string, cb: Listener) {
    this.listeners[event] = this.listeners[event] || [];
    this.listeners[event].push(cb);
  }

  off(event: string, cb: Listener) {
    this.listeners[event] = (this.listeners[event] || []).filter(l => l !== cb);
  }

  emit(event: string, payload?: any) {
    (this.listeners[event] || []).forEach(l => l(payload));
  }
}

export const errorEmitter = new Emitter();
