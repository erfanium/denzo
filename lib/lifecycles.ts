import { Denzo } from "../denzo.ts";
import { findContentParser } from "./contentParser.ts";
import { callHook, callHook as _callHook } from "./hooks.ts";
import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";
import { findRoute } from "./router.ts";

// LC
async function routing(app: Denzo, request: DenzoRequest, reply: DenzoReply) {
  const [route, params] = findRoute(
    app.routeTrees!,
    request.method,
    request.url.pathname,
  );

  request.params = params;
  request.route = route || app.fourOhFourRoute;

  await callHook("onRequest", request, reply, request.route.hooks);
  return;
}

// LC
async function parsing(app: Denzo, request: DenzoRequest, reply: DenzoReply) {
  if (reply.sent) return; // already sent
  if (request.method === "GET") return; // GET requests have no body
  if (request.route.is404) return;

  const contentType = request.headers.get("content-type") ||
    app.defaultContentType;
  const parser = findContentParser(app.contentParsers, contentType);
  if (!parser) {
    reply.status(400).send({
      errorCode: "BAD_CONTENT_TYPE",
      message: `No content type parser found for '${contentType}'`,
    });
    return;
  }

  request.body = await parser(request, reply);
}

// LC
async function validating(
  _app: Denzo,
  request: DenzoRequest,
  reply: DenzoReply,
) {
  if (reply.sent) return; // already sent
  if (request.route.is404) return;

  await callHook(
    "preValidation",
    request,
    reply,
    request.route.hooks,
  );

  const validators = request.route.validators;
  if (!validators) return;

  for (const _key in validators) {
    const key = _key as "body" | "params" | "query";
    const validator = validators[key];
    if (!validator) continue;
    const error = validator(request[key]);
    if (!error) continue;
    reply.status(400).send({
      errorCode: "VALIDATION_ERROR",
      message: key + " " + error.message,
    });
    return;
  }

  return;
}

// LC
async function handling(_app: Denzo, request: DenzoRequest, reply: DenzoReply) {
  if (reply.sent) return; // already sent

  await callHook(
    "preHandler",
    request,
    reply,
    request.route.hooks,
  );

  if (request.route.is404) {
    return reply.status(404).send();
  }

  const body = await request.route.handler(request, reply);
  if (body === undefined || body === null) return;
  reply.send(body);
}

//LC
async function errorHandling(
  app: Denzo,
  request: DenzoRequest,
  reply: DenzoReply,
  error: Error,
) {
  await app.errorHandler(error, request, reply);
  callHook(
    "onError",
    request,
    reply,
    request.route.hooks,
    error,
  );
}

function serialize(
  app: Denzo,
  request: DenzoRequest,
  reply: DenzoReply,
): Response {
  if (reply.body instanceof Response) return reply.body;

  const serializedBody = app.serializer(request, reply);
  return new Response(serializedBody, {
    headers: reply.headers,
    status: reply.statusCode,
  });
}

export async function start(
  app: Denzo,
  request: DenzoRequest,
  reply: DenzoReply,
) {
  try {
    await routing(app, request, reply);
    await parsing(app, request, reply);
    await validating(app, request, reply);
    await handling(app, request, reply);
    await callHook(
      "preSerialization",
      request,
      reply,
      request.route.hooks,
    );
  } catch (error) {
    await errorHandling(app, request, reply, error);
  }

  const response = serialize(app, request, reply);
  reply.responseTime = performance.now() - reply.createdAt;
  return response;
}
