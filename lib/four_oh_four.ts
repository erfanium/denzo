import { Hooks } from "./hooks.ts";
import { Route } from "./route.ts";

export interface FourOhFourRoute {
  hooks: Hooks;
  validators: Route["validators"];
  is404: true;
}
