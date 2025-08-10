ts
// src/core/MeshBus.ts
type MeshEvent = {
  type: string;
  payload: any;
};

type MeshListener = (event: MeshEvent) => void;

class MeshBus {
  private listeners: MeshListener[] = [];

  subscribe(listener: MeshListener): void {
    this.listeners.push(listener);
  }

  unsubscribe(listener: MeshListener): void {
    this.listeners = this.listeners.filter(l => l !== listener);
  }

  publish(event: MeshEvent): void {
    for (const listener of this.listeners) {
      listener(event);
    }
  }
}

export const meshBus = new MeshBus();