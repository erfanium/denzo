import { ESReply } from "./reply.ts";

export function encodeReply(reply: ESReply): Response {
  const response = new Response(JSON.stringify(reply.body), {
    status: reply.statusCode,
    headers: {
      "content-type": "application-json",
    },
  });
  return response;
}
