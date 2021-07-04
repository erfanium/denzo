import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";

export interface ContentParser {
  (request: DenzoRequest, reply: DenzoReply): Promise<unknown>;
}

export function findContentParser(
  parsers: ContentParsers,
  contentType: string,
): ContentParser | null {
  for (const [key, parser] of parsers.entries()) {
    if (typeof key === "string") {
      if (key === contentType) return parser;
      continue;
    }

    if (key.test(contentType)) return parser;
  }

  return null;
}

const jsonCP: ContentParser = async (request, reply) => {
  try {
    const body = await request.raw.json();
    return body;
  } catch (e) {
    reply.status(400).send({ errorCode: "BAD_JSON", message: e.message }); // todo
  }
};

const textCP: ContentParser = async (request, reply) => {
  try {
    const body = await request.raw.text();
    return body;
  } catch (e) {
    reply.status(400).send({ errorCode: "BAD_BODY", message: e.message }); // todo
  }
};

export type ContentParsers = Map<(string | RegExp), ContentParser>;

export const defaultParsers: ContentParsers = new Map([
  [/application\/json/, jsonCP],
  [/text\/plain/, textCP],
]);
