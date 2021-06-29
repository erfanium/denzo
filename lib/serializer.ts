import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";
export interface ReplySerializer {
  (request: DenzoRequest, reply: DenzoReply): BodyInit;
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
