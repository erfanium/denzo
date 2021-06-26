import { ESRequest } from "./request.ts";
import { ESReply } from "./reply.ts";
import { ValidatorFunction } from "./schema.ts";
import { Espresso } from "../espresso.ts";

export type HTTPMethods =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "OPTIONS";


export type Schema = Record<string, unknown>

export interface RouteInit {
  method: HTTPMethods;
  url: string;
  schema?: {
    params?: Schema
    query?: Schema
    body?: Schema
  }
  handler(request: ESRequest, reply: ESReply): unknown;
}

export class Route {
  method: HTTPMethods;
  url: string;
  schema?: {
    params?: Schema
    query?: Schema
    body?: Schema
  }
  validators?: {
    params?: ValidatorFunction
    query?: ValidatorFunction
    body?: ValidatorFunction
  }
  handler: RouteInit["handler"];

  constructor(app: Espresso, routeInit: RouteInit) {
    this.method = routeInit.method;
    this.url = routeInit.url;
    this.handler = routeInit.handler;
    this.schema = routeInit.schema;
    if (this.schema) {
      this.validators = {
        params: this.schema.params && app.schemaCompiler(this.schema.params),
        query: this.schema.query && app.schemaCompiler(this.schema.query),
        body: this.schema.body && app.schemaCompiler(this.schema.body),
      }
    }
  }
}
