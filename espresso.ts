import { ContentTypes } from "./lib/contentTypes.ts";
import { defaultErrorHandler, ErrorHandler } from "./lib/errorHandler.ts";
import { start } from "./lib/lifecycles.ts";
import { Plugin } from "./lib/plugin.ts";
import { ESReply } from "./lib/reply.ts";
import { ESRequest } from "./lib/request.ts";
import { Route, RouteInit } from "./lib/route.ts";
import { buildRouter, Router } from "./lib/router.ts";
import { buildAjvSchemaCompiler, SchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer, ReplySerializer } from "./lib/serializer.ts";

export interface EspressoInit {
  root?: boolean;
  prefix?: string;
  router?: Router;
  contentTypes?: ContentTypes;
  schemaCompiler?: SchemaCompiler;
  serializer?: ReplySerializer;
  errorHandler?: ErrorHandler;
}

export interface RegisterOptions {
  prefix?: string;
}

export class Espresso {
  root: boolean;
  prefix: string;
  router: Router;
  contentTypes: ContentTypes;
  schemaCompiler: SchemaCompiler;
  serializer: ReplySerializer;
  errorHandler: ErrorHandler;

  constructor(init: EspressoInit = {}) {
    this.root = init.root === undefined ? true : init.root;
    this.prefix = init.prefix || "";
    this.router = init.router || buildRouter();
    this.contentTypes = init.contentTypes || new ContentTypes();
    this.schemaCompiler = init.schemaCompiler || buildAjvSchemaCompiler();
    this.serializer = init.serializer || defaultSerializer;
    this.errorHandler = init.errorHandler || defaultErrorHandler;
  }

  route(routeInit: RouteInit) {
    const route = new Route(this, routeInit);
    this.router.add(route.method, this.prefix + route.url, route);
  }

  handle({ request: rawRequest, respondWith }: Deno.RequestEvent) {
    const reply = new ESReply(respondWith);
    const request = new ESRequest(rawRequest);
    return start(this, request, reply);
  }

  register(plugin: Plugin, registerOpts: RegisterOptions = {}) {
    const newScope = new Espresso({
      root: false,
      prefix: registerOpts.prefix,
      router: this.router,
      contentTypes: this.contentTypes,
      schemaCompiler: this.schemaCompiler,
      serializer: this.serializer,
      errorHandler: this.errorHandler,
    });

    plugin(newScope);
  }
}
