import { ContentParsers, defaultParsers } from "./lib/content_parser.ts";
import { defaultErrorHandler, ErrorHandler } from "./lib/error_handler.ts";
import { FourOhFourRoute } from "./lib/four_oh_four.ts";
import { addHook, finalizeHooks, Hook, HookNames, Hooks } from "./lib/hooks.ts";
import { start } from "./lib/lifecycle.ts";
import { PluginBuilder } from "./lib/plugin.ts";
import { DenzoReply } from "./lib/reply.ts";
import { DenzoRequest } from "./lib/request.ts";
import { DefaultRouteTypes, Route, RouteInit } from "./lib/route.ts";
import { buildTrees, RouteTrees } from "./lib/router.ts";
import { buildAjvSchemaCompiler, SchemaCompiler } from "./lib/schema.ts";
import { defaultSerializer, ReplySerializer } from "./lib/serializer.ts";
import { noop, serve } from "./lib/server.ts";

export interface DenzoInit {
  isRoot?: boolean;
  name?: string;
  prefix?: string;
  contentParsers?: ContentParsers;
  schemaCompiler?: SchemaCompiler;
  serializer?: ReplySerializer;
  errorHandler?: ErrorHandler;
  permissions?: Permissions;
}

export interface RegisterOptions {
  prefix?: `/${string}`;
  allowParentHooks?: boolean;
}

export interface AddHookOptions {
  scope?: "this" | "parent";
}

export interface Plugin {
  prefix: string;
  context: Denzo;
}

interface Permissions {
  parentHook?: Hooks;
}

export class Denzo {
  contentParsers: ContentParsers;
  defaultContentType: string;
  schemaCompiler: SchemaCompiler;
  serializer: ReplySerializer;
  errorHandler: ErrorHandler;
  routeTrees: RouteTrees | null;
  fourOhFourRoute: FourOhFourRoute;
  readonly isRoot: boolean;
  readonly name: string;
  readonly routes: Route[];
  readonly plugins: Plugin[];
  readonly hooks: Hooks;
  protected ready: boolean;
  protected permissions: Permissions;

  constructor(init: DenzoInit = {}) {
    this.isRoot = true;
    this.name = init.name || "root";
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
    this.permissions = init.permissions || { parentHook: this.hooks };

    this.contentParsers = init.contentParsers || defaultParsers;
    this.defaultContentType = "text/plain";
    this.schemaCompiler = init.schemaCompiler || buildAjvSchemaCompiler();
    this.serializer = init.serializer || defaultSerializer;
    this.errorHandler = init.errorHandler || defaultErrorHandler;
  }

  route<T extends DefaultRouteTypes = DefaultRouteTypes>(
    routeInit: RouteInit<T>,
  ) {
    const route = new Route(
      Object.assign({ schemaCompiler: this.schemaCompiler }, routeInit),
    );
    this.routes.push(route);
  }

  register<T>(
    pluginBuilder: PluginBuilder<T>,
    { prefix, allowParentHooks }: RegisterOptions = {},
    pluginConfig?: T,
  ) {
    const context = new Denzo({
      isRoot: false,
      name: pluginBuilder.name,
      contentParsers: this.contentParsers,
      schemaCompiler: this.schemaCompiler,
      serializer: this.serializer,
      errorHandler: this.errorHandler,
      permissions: allowParentHooks ? { parentHook: this.hooks } : {},
    });

    pluginBuilder.fn(context, pluginConfig);
    this.plugins.push({ prefix: prefix || "", context });
  }

  addHook(name: HookNames, hook: Hook, options: AddHookOptions = {}) {
    if (options.scope === "parent") {
      if (!this.permissions.parentHook) {
        throw new Error(
          `Permission denied. plugin '${this.name}' has no permission to add a parent-level hook`,
        );
      }

      addHook(this.permissions.parentHook, name, hook);
    }
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
