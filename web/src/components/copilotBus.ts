type Listener = (text: string) => void;
let listener: Listener | null = null;

export const copilotBus = {
  subscribe(fn: Listener) { listener = fn; return () => { listener = null; }; },
  ask(text: string) { listener?.(text); },
};
