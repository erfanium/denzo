import { Espresso } from "../espresso.ts";
import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

function routing(app: Espresso, request: ESRequest) {
  const [route, params] = app.router.find(request.method, request.url.pathname);

  request.params = params;
  request.route = route;
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
  if (reply.sent) return; // already sent
  if (!request.route) return;
  

  const validators = request.route.validators;
  if (!validators) return;

  for (const _key in validators) {
    const key = _key as 'body' | 'params' | 'query'
    const validator = validators[key];
    if (!validator) continue;
    const error = validator(request[key]);
    if (!error) continue;
    reply.status(422).send(error);
    return
  }

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
    }),
  );
}

export async function start(
  app: Espresso,
  { request: rawRequest, respondWith }: Deno.RequestEvent,
) {
  const reply = new ESReply(respondWith);
  const request = new ESRequest(rawRequest);
  routing(app, request);
  await parsing(app, request, reply);
  validating(app, request, reply);
  await handling(app, request, reply);
  serializing(app, request, reply);
}
