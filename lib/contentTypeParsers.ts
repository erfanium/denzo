import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export interface ContentTypeParser {
  (request: ESRequest, reply: ESReply): Promise<unknown>;
}

const jsonCP: ContentTypeParser = async (request, reply) => {
  try {
    const body = await request.raw.json();
    return body;
  } catch (_) {
    reply.status(400).send({ error: "Syntax error in JSON body" }); // todo
  }
};

const textCP: ContentTypeParser = async (request, reply) => {
  try {
    const body = await request.raw.text();
    return body;
  } catch (_) {
    reply.status(400).send({ error: "Syntax error in text body" }); // todo
  }
};

export type ContentTypeParsers = Map<string, ContentTypeParser>;

export const defaultParsers: ContentTypeParsers = new Map([
  ["application/json", jsonCP],
  ["text/plain", textCP],
]);
