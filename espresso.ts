import { ContentTypes } from "./lib/contentTypes.ts";
import { start } from "./lib/lifecycles.ts";
import { Route, RouteInit } from "./lib/route.ts";
import { buildRouter } from "./lib/router.ts";
import { buildAjvSchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer } from "./lib/serializer.ts";

export class Espresso {
  router = buildRouter();
  contentTypes = new ContentTypes();
  schemaCompiler = buildAjvSchemaCompiler();
  serializer = defaultSerializer;
  route(routeInit: RouteInit) {
    const route = new Route(this, routeInit);
    this.router.add(route.method, route.url, route);
  }

  handle(re: Deno.RequestEvent) {
    return start(this, re);
  }
}
