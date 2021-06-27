import { Espresso } from "../espresso.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

interface Lifecycle {
  (app: Espresso, request: ESRequest, reply: ESReply): Promise<void>;
}

function routing(app: Espresso, request: ESRequest) {
  const [route, params] = app.router.find(request.method, request.url.pathname);

  request.params = params;
  request.route = route;
  return Promise.resolve();
}

async function parsing(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  const parser = app.contentTypes.findParser(request);
  if (!parser) {
    throw new Error("No parser"); // todo
  }

  request.body = await parser(request, reply);
}

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

async function handling(_: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  if (!request.route) {
    return reply.status(404).send();
  }

  const body = await request.route.handler(request, reply);
  if (body === undefined || body === null) return;
  reply.send(body);
}

function serializing(app: Espresso, request: ESRequest, reply: ESReply) {
  const serializedBody = app.serializer(request, reply);
  reply.responseWith(
    new Response(serializedBody, {
      headers: reply.headers,
      status: reply.statusCode,
    })
  );
}

function callLifecycle(
  lc: Lifecycle,
  app: Espresso,
  request: ESRequest,
  reply: ESReply
) {
  return lc(app, request, reply).catch((error) =>
    app.errorHandler(error, request, reply)
  );
}

export async function start(app: Espresso, request: ESRequest, reply: ESReply) {
  await callLifecycle(routing, app, request, reply);
  await callLifecycle(parsing, app, request, reply);
  await callLifecycle(validating, app, request, reply);
  await callLifecycle(handling, app, request, reply);
  serializing(app, request, reply);
}
