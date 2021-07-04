import { DenzoRequest } from "./request.ts";
import { DenzoReply } from "./reply.ts";
import { SchemaCompiler, ValidatorFunction } from "./schema.ts";
import { Hook, Hooks } from "./hooks.ts";
import { allHTTPMethods, HTTPMethods } from "./httpMethods.ts";

// deno-lint-ignore ban-types
export type Schema = Object;
export type Url = `/${string}`;

export interface DefaultRouteTypes {
  Params?: unknown;
  Body?: unknown;
  Query?: unknown;
  Response?: unknown;
}

export interface RouteInit<T extends DefaultRouteTypes> {
  method: HTTPMethods | HTTPMethods[] | "*";
  url: Url | Url[] | "*";
  schema?: {
    params?: Schema;
    query?: Schema;
    body?: Schema;
  };
  handler(
    request: DenzoRequest<T>,
    reply: DenzoReply<T>,
  ): T["Response"] | Promise<T["Response"]> | void | Promise<void>;
  onRequest?: Hook | Hook[];
  preHandler?: Hook | Hook[];
  schemaCompiler?: SchemaCompiler;
}

function toArray<T>(i: T | T[]): T[] {
  if (Array.isArray(i)) return i;
  return [i];
}

export class Route<T extends DefaultRouteTypes = DefaultRouteTypes> {
  methods: readonly HTTPMethods[];
  urls: string[];
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
  hooks: Hooks = {};
  is404 = false;

  constructor(init: RouteInit<T>) {
    this.methods = init.method === "*" ? allHTTPMethods : toArray(init.method);
    this.urls = init.url === "*" ? ["/*"] : toArray(init.url);
    this.handler = init.handler;
    this.schema = init.schema;

    // schema
    if (this.schema && Object.keys(this.schema).length > 0) {
      if (!init.schemaCompiler) {
        throw new Error(
          `there's no schema compiler to build the route. most likely a bug in Denzo`,
        );
      }

      this.validators = {};
      if (this.schema.params) {
        this.validators.params = init.schemaCompiler(this.schema.params);
      }
      if (this.schema.query) {
        this.validators.query = init.schemaCompiler(this.schema.query);
      }
      if (this.schema.body) {
        this.validators.body = init.schemaCompiler(this.schema.body);
      }
    }

    // hooks
    if (init.onRequest) this.hooks["onRequest"] = toArray(init.onRequest);
    if (init.preHandler) this.hooks["preHandler"] = toArray(init.preHandler);
  }
}
