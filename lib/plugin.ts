import { Denzo } from "../denzo.ts";

export interface Plugin {
  (app: Denzo): void;
}
