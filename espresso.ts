import { encodeReply } from "./lib/replyEncoder.ts";
import { ESRequest } from "./lib/request.ts";
import { parseRequest } from "./lib/requestParser.ts";
import { callHandler, route } from "./lib/route.ts";
import { buildRouter } from "./lib/router.ts";
import { buildServer } from "./lib/server.ts";
import { paramsToObject } from "./utils/paramsToObject.ts";

const default404Response = new Response(undefined, { status: 404 });

export class Espresso {
  router = buildRouter();
  route = route;
  listen(listenOptions: Deno.ListenOptions) {
    buildServer(listenOptions, (e) => this.handle(e));
  }

  async handle({ request: rawRequest, respondWith }: Deno.RequestEvent) {
    const url = new URL(rawRequest.url);
    const [route, params] = this.router.find(rawRequest.method, url.pathname);
    if (!route) return respondWith(default404Response);

    const body = await parseRequest(rawRequest);

    const request: ESRequest = {
      params,
      query: paramsToObject(url.searchParams),
      body,
      headers: rawRequest.headers,
      url: rawRequest.url,
      method: rawRequest.method,
    };

    const reply = await callHandler(route, request);
    const response = encodeReply(reply)

    respondWith(response);
  }
}
