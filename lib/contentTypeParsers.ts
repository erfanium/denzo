import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export interface ContentTypeParser {
  (request: ESRequest, reply: ESReply): Promise<unknown>;
}

const jsonCP: ContentTypeParser = async (request, reply) => {
  try {
    const body = await request.raw.json();
    return body;
  } catch (e) {
    reply.status(400).send({ errorCode: "BAD_JSON", message: e.message }); // todo
  }
};

const textCP: ContentTypeParser = async (request, reply) => {
  try {
    const body = await request.raw.text();
    return body;
  } catch (e) {
    reply.status(400).send({ errorCode: "BAD_BODY", message: e.message }); // todo
  }
};

export type ContentTypeParsers = Map<string, ContentTypeParser>;

export const defaultParsers: ContentTypeParsers = new Map([
  ["application/json", jsonCP],
  ["text/plain", textCP],
]);
