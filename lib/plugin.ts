import { Espresso } from "../espresso.ts";

export interface Plugin {
  (app: Espresso): void;
}
