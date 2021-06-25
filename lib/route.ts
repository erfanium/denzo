import { ESRequest } from "./request.ts";
import { Espresso } from "../espresso.ts";
import { ESReply } from "./reply.ts";

export type HTTPMethods =
  | "DELETE"
  | "GET"
  | "HEAD"
  | "PATCH"
  | "POST"
  | "PUT"
  | "OPTIONS";

export interface RouteOptions<RouteGeneric = RouteGenericInterface> {
  handler(request: ESRequest<RouteGeneric>, reply: ESReply): unknown;
  method: HTTPMethods;
  url: string;
}

export interface RouteGenericInterface {
  Body?: unknown;
  Querystring?: unknown;
  Params?: unknown;
  Headers?: unknown;
}

export function route(this: Espresso, opts: RouteOptions) {
  this.router.add(opts.method, opts.url, opts)
}

export async function callHandler(route: RouteOptions, request: ESRequest): Promise<ESReply> {
  const reply = new ESReply()
  const body = await route.handler(request, reply)
  if (body === undefined || body === null) return reply
  reply.send(body)
  return reply
}