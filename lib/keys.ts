export type Meta = Record<symbol, unknown>;

export interface Key<T> {
  name: string;
  symbol: symbol;
  getValue(meta: Meta): T | undefined;
}

export function createKey<T>(name: string): Key<T> {
  const s = Symbol(name);
  return {
    name,
    symbol: s,
    getValue(meta) {
      // deno-lint-ignore no-explicit-any
      return (meta as any)[s];
    },
  };
}

export function setKey<T>(meta: Meta, key: Key<T>, data: T): void {
  // deno-lint-ignore no-explicit-any
  (meta as any)[key.symbol] = data;
}

export function findKey<T>(meta: Meta, key: Key<T>): T | undefined {
  return key.getValue(meta);
}

export function getKey<T>(meta: Meta, key: Key<T>): T {
  const v = key.getValue(meta);
  if (v === undefined || v === null) {
    throw new Error(`Key '${key.name}' not found`);
  }
  return v;
}
