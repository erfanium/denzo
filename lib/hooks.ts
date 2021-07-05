import { Denzo } from "../denzo.ts";
import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";

export type BasicHookNames =
  | "onRequest"
  | "preHandler"
  | "preValidation"
  | "preSerialization"
  | "onResponse";

export interface Hook {
  (request: DenzoRequest, reply: DenzoReply, error?: Error): unknown;
}

export type HookNames = BasicHookNames | "onError";

export type Hooks = {
  [key in HookNames]?: Hook[];
};

export function addHook(
  storage: Hooks,
  name: HookNames,
  hook: Hook,
): void {
  if (storage[name]) {
    storage[name]!.push(hook);
    return;
  }

  storage[name] = [hook];
  return;
}

export function getHooks(
  storage: Hooks,
  name: HookNames,
): Hook[] {
  if (storage[name]) return storage[name]!;
  return [];
}

export async function callHook(
  name: HookNames,
  request: DenzoRequest,
  reply: DenzoReply,
  hooks: Hooks,
  error?: Error,
) {
  const hooksFromApp = getHooks(hooks, name);
  for (let i = 0; i < hooksFromApp.length; i++) {
    const hook = hooksFromApp[i];
    await hook(request, reply, error);
  }
}

function mergeHooks(lowLevelHooks: Hooks, topLevelHooks: Hooks) {
  for (const _key in topLevelHooks) {
    const key = _key as HookNames;
    const lowLevelHookArray = lowLevelHooks[key];
    lowLevelHooks[key] = [];
    topLevelHooks[key]?.forEach((hook) => addHook(lowLevelHooks, key, hook));
    lowLevelHookArray?.forEach((hook) => addHook(lowLevelHooks, key, hook));
  }
}

export function finalizeHooks(root: Denzo) {
  function finalizeContextHooks(thisContext: Denzo) {
    thisContext.routes.forEach((route) => {
      mergeHooks(route.hooks, thisContext.hooks);
    });

    thisContext.plugins.forEach((plugin) => {
      mergeHooks(plugin.context.hooks, thisContext.hooks);
      finalizeContextHooks(plugin.context);
    });
  }

  finalizeContextHooks(root);
}
