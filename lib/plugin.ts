import { Denzo } from "../denzo.ts";

export interface PluginBuilder {
  (context: Denzo): void;
}
