import { ESReply } from "./reply.ts";
import { ESRequest } from "./request.ts";

export interface ContentTypeParser {
  (request: ESRequest, reply: ESReply): Promise<unknown>;
}

const jsonContentParser: ContentTypeParser = async (request, reply) => {
  try {
    const body = await request.raw.json();
    return body;
  } catch(e) {
    reply.status(400).send({ error: 'Syntax error in JSON body' }) // todo
  }
}

export class ContentTypes {
  default = "text/plain";
  parsers = new Map<string, ContentTypeParser>();
  constructor() {
    this.parsers.set("application/json", jsonContentParser);
    this.parsers.set("text/plain", (request) => request.raw.text());
  }

  findParser(request: ESRequest) {
    return this.parsers.get(
      request.headers.get("content-type") || this.default,
    );
  }
}
