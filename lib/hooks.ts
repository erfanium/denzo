import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export type HookNames = "onRequest" | "preHandler";

export interface Hook {
  (request: ESRequest, reply: ESReply): unknown;
}

export type HookStorage = {
  [key in HookNames]?: Hook[];
};

export function addHook(storage: HookStorage, name: HookNames, hook: Hook) {
  if (storage[name]) {
    storage[name]!.push(hook);
    return;
  }

  storage[name] = [hook];
  return;
}

export function getHooks(storage: HookStorage, name: HookNames): Hook[] {
  if (storage[name]) return storage[name]!;
  return [];
}

export async function callHook(
  name: HookNames,
  request: ESRequest,
  reply: ESReply,
  appHooks: HookStorage,
  routeHooks?: HookStorage,
) {
  const hooksFromApp = getHooks(appHooks, name);
  for (let i = 0; i < hooksFromApp.length; i++) {
    const hook = hooksFromApp[i];
    await hook(request, reply);
  }

  if (!routeHooks) return;
  const hooksFromRoute = getHooks(routeHooks, name);
  for (let i = 0; i < hooksFromRoute.length; i++) {
    const hook = hooksFromRoute[i];
    await hook(request, reply);
  }
}
