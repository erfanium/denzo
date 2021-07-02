import { Denzo } from "../denzo.ts";

export interface PluginBuilder<T = void> {
  name: string;
  fn(context: Denzo, config: T): void;
}

export function createPlugin<T>(name: string, fn: PluginBuilder<T>["fn"]) {
  return {
    name,
    fn,
  };
}
