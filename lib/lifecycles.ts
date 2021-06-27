import { Espresso } from "../espresso.ts";
import { callHook, callHook as _callHook, HookNames } from "./hooks.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

interface Lifecycle {
  (app: Espresso, request: ESRequest, reply: ESReply): Promise<void>;
}

// LC
function routing(app: Espresso, request: ESRequest, _reply: ESReply) {
  const [route, params] = app.router.find(request.method, request.url.pathname);

  request.params = params;
  request.route = route;
  return Promise.resolve();
}

// LC
async function parsing(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  const parser = app.contentTypes.findParser(request);
  if (!parser) {
    throw new Error("No parser"); // todo
  }

  request.body = await parser(request, reply);
}

// LC
function validating(_: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return Promise.resolve(); // already sent
  if (!request.route) return Promise.resolve();

  const validators = request.route.validators;
  if (!validators) return Promise.resolve();

  for (const _key in validators) {
    const key = _key as "body" | "params" | "query";
    const validator = validators[key];
    if (!validator) continue;
    const error = validator(request[key]);
    if (!error) continue;
    reply.status(422).send(error);
    return Promise.resolve();
  }

  return Promise.resolve();
}

// LC
async function handling(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  if (!request.route) {
    return reply.status(404).send();
  }

  const body = await request.route.handler(request, reply);
  if (body === undefined || body === null) return;
  reply.send(body);
}

// LC
function serializing(app: Espresso, request: ESRequest, reply: ESReply) {
  const serializedBody = app.serializer(request, reply);
  reply.responseWith(
    new Response(serializedBody, {
      headers: reply.headers,
      status: reply.statusCode,
    }),
  );
}

function execLC(
  lc: Lifecycle,
  app: Espresso,
  request: ESRequest,
  reply: ESReply,
) {
  return lc(app, request, reply).catch((error) =>
    app.errorHandler(error, request, reply)
  );
}

function execHook(
  name: HookNames,
  app: Espresso,
  request: ESRequest,
  reply: ESReply,
) {
  return callHook(name, request, reply, app.hooks, request.route?.hooks).catch((
    error,
  ) => app.errorHandler(error, request, reply));
}

export async function start(app: Espresso, request: ESRequest, reply: ESReply) {
  await execLC(routing, app, request, reply);
  await execHook("onRequest", app, request, reply);
  await execLC(parsing, app, request, reply);
  await execLC(validating, app, request, reply);
  await execHook("preHandler", app, request, reply);
  await execLC(handling, app, request, reply);
  serializing(app, request, reply);
}
