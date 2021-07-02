import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";

export type BasicHookNames =
  | "onRequest"
  | "preHandler"
  | "preValidation"
  | "preSerialization";

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
  appHooks: Hooks,
  routeHooks?: Hooks,
  error?: Error,
) {
  const hooksFromApp = getHooks(appHooks, name);
  for (let i = 0; i < hooksFromApp.length; i++) {
    const hook = hooksFromApp[i];
    await hook(request, reply, error);
  }

  if (!routeHooks) return;
  const hooksFromRoute = getHooks(routeHooks, name);
  for (let i = 0; i < hooksFromRoute.length; i++) {
    const hook = hooksFromRoute[i];
    await hook(request, reply, error);
  }
}
