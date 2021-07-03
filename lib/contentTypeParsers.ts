import { DenzoReply } from "./reply.ts";
import { DenzoRequest } from "./request.ts";

export interface ContentTypeParser {
  (request: DenzoRequest, reply: DenzoReply): Promise<unknown>;
}

export function findContentParser(
  parsers: ContentTypeParsers,
  contentType: string,
): ContentTypeParser | null {
  for (const [key, parser] of parsers.entries()) {
    if (typeof key === "string") {
      if (key === contentType) return parser;
      continue;
    }

    if (key.test(contentType)) return parser;
  }

  return null;
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

export type ContentTypeParsers = Map<(string | RegExp), ContentTypeParser>;

export const defaultParsers: ContentTypeParsers = new Map([
  [/application\/json/, jsonCP],
  [/application\/text/, textCP],
]);
