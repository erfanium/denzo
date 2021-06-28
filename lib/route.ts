import { ESRequest } from "./request.ts";
import { ESReply } from "./reply.ts";
import { ValidatorFunction } from "./schema.ts";
import { Espresso } from "../espresso.ts";
import { Hook, HookStorage } from "./hooks.ts";
import { HTTPMethods } from "./httpMethods.ts";

// deno-lint-ignore ban-types
export type Schema = Object;

export interface DefaultRouteTypes {
  Params?: unknown;
  Body?: unknown;
  Query?: unknown;
  Response?: unknown;
}

export interface RouteInit<T extends DefaultRouteTypes> {
  method: HTTPMethods;
  url: string;
  schema?: {
    params?: Schema;
    query?: Schema;
    body?: Schema;
  };
  handler(
    request: ESRequest<T>,
    reply: ESReply<T>,
  ): T["Response"] | Promise<T["Response"]> | void | Promise<void>;
  onRequest?: Hook | Hook[];
  preHandler?: Hook | Hook[];
}

function toArray<T>(i: T | T[]): T[] {
  if (Array.isArray(i)) return i;
  return [i];
}

export class Route<T extends DefaultRouteTypes = DefaultRouteTypes> {
  method: HTTPMethods;
  url: string;
  finalUrl: string;
  schema?: {
    params?: Schema;
    query?: Schema;
    body?: Schema;
  };
  validators?: {
    params?: ValidatorFunction;
    query?: ValidatorFunction;
    body?: ValidatorFunction;
  };
  handler: RouteInit<T>["handler"];
  hooks: HookStorage = {};

  constructor(app: Espresso, init: RouteInit<T>) {
    this.method = init.method;
    this.url = init.url;
    this.finalUrl = app.root + init.url;
    this.handler = init.handler;
    this.schema = init.schema;

    // schema
    if (this.schema && Object.keys(this.schema).length > 0) {
      this.validators = {};
      if (this.schema.params) {
        this.validators.params = app.schemaCompiler(this.schema.params);
      }
      if (this.schema.query) {
        this.validators.query = app.schemaCompiler(this.schema.query);
      }
      if (this.schema.body) {
        this.validators.body = app.schemaCompiler(this.schema.body);
      }
    }

    // hooks
    if (init.onRequest) this.hooks["onRequest"] = toArray(init.onRequest);
    if (init.preHandler) this.hooks["preHandler"] = toArray(init.preHandler);
  }
}
