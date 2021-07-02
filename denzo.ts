import {
  ContentTypeParsers,
  defaultParsers,
} from "./lib/contentTypeParsers.ts";
import { defaultErrorHandler, ErrorHandler } from "./lib/errorHandler.ts";
import { FourOhFourRoute } from "./lib/fourOhFour.ts";
import { addHook, finalizeHooks, Hook, HookNames, Hooks } from "./lib/hooks.ts";
import { start } from "./lib/lifecycles.ts";
import { PluginBuilder } from "./lib/plugin.ts";
import { DenzoReply } from "./lib/reply.ts";
import { DenzoRequest } from "./lib/request.ts";
import { DefaultRouteTypes, Route, RouteInit } from "./lib/route.ts";
import { buildTrees, RouteTrees } from "./lib/router.ts";
import { buildAjvSchemaCompiler, SchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer, ReplySerializer } from "./lib/serializer.ts";
import { noop, serve } from "./lib/server.ts";

export interface DenzoInit {
  root?: boolean;
  prefix?: string;
  contentTypeParsers?: ContentTypeParsers;
  schemaCompiler?: SchemaCompiler;
  serializer?: ReplySerializer;
  errorHandler?: ErrorHandler;
}

export interface RegisterOptions {
  prefix?: string;
}

export interface Plugin {
  prefix: string;
  context: Denzo;
}

export class Denzo {
  contentTypeParsers: ContentTypeParsers;
  defaultContentType: string;
  schemaCompiler: SchemaCompiler;
  serializer: ReplySerializer;
  errorHandler: ErrorHandler;
  routeTrees: RouteTrees | null;
  fourOhFourRoute: FourOhFourRoute;
  readonly name: string;
  readonly routes: Route[];
  readonly plugins: Plugin[];
  readonly hooks: Hooks;
  protected ready: boolean;

  constructor(init: DenzoInit = {}) {
    this.name = "root";
    this.ready = false;
    this.routes = [];
    this.plugins = [];
    this.routeTrees = null;
    this.hooks = {};
    this.fourOhFourRoute = {
      hooks: this.hooks,
      validators: {},
      is404: true,
    };

    this.contentTypeParsers = init.contentTypeParsers || defaultParsers;
    this.defaultContentType = "text/plain";
    this.schemaCompiler = init.schemaCompiler || buildAjvSchemaCompiler();
    this.serializer = init.serializer || defaultSerializer;
    this.errorHandler = init.errorHandler || defaultErrorHandler;
  }

  route<T extends DefaultRouteTypes = DefaultRouteTypes>(
    routeInit: RouteInit<T>,
  ) {
    const route = new Route(this, routeInit);
    this.routes.push(route);
  }

  register(
    pluginBuilder: PluginBuilder,
    { prefix }: RegisterOptions = {},
  ) {
    const context = new Denzo({
      contentTypeParsers: this.contentTypeParsers,
      schemaCompiler: this.schemaCompiler,
      serializer: this.serializer,
      errorHandler: this.errorHandler,
    });

    pluginBuilder(context);
    this.plugins.push({ prefix: prefix || "", context });
  }

  addHook(name: HookNames, hook: Hook) {
    addHook(this.hooks, name, hook);
  }

  finalize() {
    if (this.ready) return; // todo throw Error
    this.routeTrees = buildTrees(this);
    finalizeHooks(this);
    this.ready = true;
  }

  serve(listener: Deno.Listener) {
    if (!this.ready) this.finalize();

    serve(this, listener);
  }

  async handle({ request: rawRequest, respondWith }: Deno.RequestEvent) {
    if (!this.ready) {
      throw new Error("App is not ready! call app.finalize() first");
    }

    const reply = new DenzoReply();
    const request = new DenzoRequest(rawRequest);
    const response = await start(this, request, reply);
    respondWith(response).catch(noop);
  }
}
