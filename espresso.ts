import { ContentTypes } from "./lib/contentTypes.ts";
import { defaultErrorHandler } from "./lib/errorHandler.ts";
import { start } from "./lib/lifecycles.ts";
import { ESReply } from "./lib/reply.ts";
import { ESRequest } from "./lib/request.ts";
import { Route, RouteInit } from "./lib/route.ts";
import { buildRouter } from "./lib/router.ts";
import { buildAjvSchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer } from "./lib/serializer.ts";

export class Espresso {
  router = buildRouter();
  contentTypes = new ContentTypes();
  schemaCompiler = buildAjvSchemaCompiler();
  serializer = defaultSerializer;
  errorHandler = defaultErrorHandler;
  route(routeInit: RouteInit) {
    const route = new Route(this, routeInit);
    this.router.add(route.method, route.url, route);
  }

  handle({ request: rawRequest, respondWith }: Deno.RequestEvent) {
    const reply = new ESReply(respondWith);
    const request = new ESRequest(rawRequest);
    return start(this, request, reply)
  }
}
