import { Espresso } from "../espresso.ts";
import { callHook, callHook as _callHook } from "./hooks.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";
import { findRoute } from "./router.ts";

interface Lifecycle {
  (app: Espresso, request: ESRequest, reply: ESReply): Promise<void>;
}

// LC
async function routing(app: Espresso, request: ESRequest, reply: ESReply) {
  const [route, params] = findRoute(
    app.routeTrees,
    request.method,
    request.url.pathname,
  );

  request.params = params;
  request.route = route;

  await callHook("onRequest", request, reply, app.hooks, request.route?.hooks);
  return;
}

// LC
async function parsing(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  if (request.method === "GET") return; // GET requests have no body
  const contentType = request.headers.get("content-type") ||
    app.defaultContentType;
  const parser = app.contentTypeParsers.get(contentType);
  if (!parser) {
    reply.code(400).send({
      errorCode: "BAD_CONTENT_TYPE",
      message: `No content type parser found for '${contentType}'`,
    });
    return;
  }

  request.body = await parser(request, reply);
}

// LC
async function validating(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent
  if (!request.route) return;

  await callHook(
    "preValidation",
    request,
    reply,
    app.hooks,
    request.route?.hooks,
  );

  const validators = request.route.validators;
  if (!validators) return;

  for (const _key in validators) {
    const key = _key as "body" | "params" | "query";
    const validator = validators[key];
    if (!validator) continue;
    const error = validator(request[key]);
    if (!error) continue;
    reply.code(400).send({
      errorCode: "VALIDATION_ERROR",
      message: key + ' ' + error.message,
    });
    return;
  }

  return;
}

// LC
async function handling(app: Espresso, request: ESRequest, reply: ESReply) {
  if (reply.sent) return; // already sent

  await callHook(
    "preHandler",
    request,
    reply,
    app.hooks,
    request.route?.hooks,
  );

  if (!request.route) {
    return reply.code(404).send();
  }

  const body = await request.route.handler(request, reply);
  if (body === undefined || body === null) return;
  reply.send(body);
}

// LC
async function serializing(app: Espresso, request: ESRequest, reply: ESReply) {
  const serializedBody = app.serializer(request, reply);
  await reply.responseWith(
    new Response(serializedBody, {
      headers: reply.headers,
      status: reply.statusCode,
    }),
  );
}

//LC
async function errorHandling(
  app: Espresso,
  request: ESRequest,
  reply: ESReply,
  error: Error,
) {
  await app.errorHandler(error, request, reply);
  callHook(
    "onError",
    request,
    reply,
    app.hooks,
    request.route?.hooks,
    error,
  );
}

export async function start(app: Espresso, request: ESRequest, reply: ESReply) {
  try {
    await routing(app, request, reply);
    await parsing(app, request, reply);
    await validating(app, request, reply);
    await handling(app, request, reply);
    await callHook(
      "preSerialization",
      request,
      reply,
      app.hooks,
      request.route?.hooks,
    );
  } catch (error) {
    await errorHandling(app, request, reply, error);
  } finally {
    await serializing(app, request, reply);
  }
}
