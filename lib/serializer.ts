import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";
export interface ReplySerializer {
  (request: ESRequest, reply: ESReply): BodyInit;
}

export const defaultSerializer: ReplySerializer = (_, reply) => {
  const body = reply.body;
  if (typeof body === "string") {
    reply.headers.set("content-type", "text/plain");
    return body;
  }

  if (typeof body === "number" || typeof body === "boolean") {
    reply.headers.set("content-type", "text/plain");
    return body.toString();
  }

  reply.headers.set("content-type", "application/json");
  return JSON.stringify(body);
};
