import {
  ContentTypeParsers,
  defaultParsers,
} from "./lib/contentTypeParsers.ts";
import { defaultErrorHandler, ErrorHandler } from "./lib/errorHandler.ts";
import { addHook, Hook, HookNames, HookStorage } from "./lib/hooks.ts";
import { start } from "./lib/lifecycles.ts";
import { Plugin } from "./lib/plugin.ts";
import { ESReply } from "./lib/reply.ts";
import { ESRequest } from "./lib/request.ts";
import { DefaultRouteTypes, Route, RouteInit } from "./lib/route.ts";
import { addRoute, getRoutes, RouteTrees } from "./lib/router.ts";
import { buildAjvSchemaCompiler, SchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer, ReplySerializer } from "./lib/serializer.ts";
import { serve } from "./lib/server.ts";

export interface EspressoInit {
  root?: boolean;
  prefix?: string;
  routeTrees?: RouteTrees;
  contentTypeParsers?: ContentTypeParsers;
  schemaCompiler?: SchemaCompiler;
  serializer?: ReplySerializer;
  errorHandler?: ErrorHandler;
}

export interface RegisterOptions {
  prefix?: string;
}

export class Espresso {
  contentTypeParsers: ContentTypeParsers;
  defaultContentType: string;
  schemaCompiler: SchemaCompiler;
  serializer: ReplySerializer;
  errorHandler: ErrorHandler;
  readonly root: boolean;
  readonly prefix: string;
  readonly routeTrees: RouteTrees;
  readonly hooks: HookStorage = {};

  constructor(init: EspressoInit = {}) {
    this.root = init.root === undefined ? true : init.root;
    this.prefix = init.prefix || "";
    this.routeTrees = init.routeTrees || {};
    this.contentTypeParsers = init.contentTypeParsers || defaultParsers;
    this.defaultContentType = "text/plain";
    this.schemaCompiler = init.schemaCompiler || buildAjvSchemaCompiler();
    this.serializer = init.serializer || defaultSerializer;
    this.errorHandler = init.errorHandler || defaultErrorHandler;
  }

  serve(listener: Deno.Listener) {
    serve(this, listener);
  }

  route<T extends DefaultRouteTypes = DefaultRouteTypes>(
    routeInit: RouteInit<T>,
  ) {
    const route = new Route(this, routeInit);
    addRoute(this.routeTrees, route.method, route.finalUrl, route);
  }

  handle({ request: rawRequest, respondWith }: Deno.RequestEvent) {
    const reply = new ESReply(respondWith);
    const request = new ESRequest(rawRequest);
    return start(this, request, reply);
  }

  getRoutes() {
    return getRoutes(this.routeTrees);
  }

  register(plugin: Plugin, registerOpts: RegisterOptions = {}) {
    const newScope = new Espresso({
      root: false,
      prefix: registerOpts.prefix,
      routeTrees: this.routeTrees,
      contentTypeParsers: this.contentTypeParsers,
      schemaCompiler: this.schemaCompiler,
      serializer: this.serializer,
      errorHandler: this.errorHandler,
    });

    plugin(newScope);
  }

  addHook(name: HookNames, hook: Hook) {
    addHook(this.hooks, name, hook);
  }
}
